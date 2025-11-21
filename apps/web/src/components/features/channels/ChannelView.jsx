import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChannelStore } from '../../../stores/channelStore';
import { useAuthStore } from '../../../stores/authStore';
import PostCreator from './PostCreator';
import PostCard from './PostCard';
import { ArrowLeftIcon, ExclamationCircleIcon, ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';

const ChannelView = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    channel,
    posts,
    isLoading,
    error,
    permissions,
    getChannelByEventId,
    fetchChannelPosts,
    addPostFromSocket,
    updatePostLike,
    updatePostLikeFromSocket,
    addCommentFromSocket,
    removePostFromSocket,
    reset
  } = useChannelStore();

  const [socket, setSocket] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Initialize channel
  useEffect(() => {
    const loadChannel = async () => {
      const result = await getChannelByEventId(eventId);
      
      if (result.success && result.channel) {
        // Load posts
        await fetchChannelPosts(result.channel.id);
      } else {
        // Handle access denied or error
        if (result.error) {
          setAccessDenied(true);
        }
      }
    };

    loadChannel();

    return () => {
      reset();
    };
  }, [eventId]);

  // Setup WebSocket
  useEffect(() => {
    if (!channel || !user) return;

    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
      auth: {
        userId: user.id
      }
    });

    newSocket.on('connect', () => {
      // Join event channel
      newSocket.emit('join-event-channel', eventId);
    });

    // Listen for real-time events
    newSocket.on('new-post', (data) => {
      if (data.channelId === channel.id && data.post.author.id !== user.id) {
        addPostFromSocket(data.post);
      }
    });

    newSocket.on('post-liked', (data) => {
      // Only update if it's not our own action (to avoid double updates)
      if (data.userId !== user.id) {
        // For other users' actions, only update the count, preserve our own like status
        updatePostLikeFromSocket(data.postId, data.likeCount);
      }
    });

    newSocket.on('new-comment', (data) => {
      if (data.comment.author.id !== user.id) {
        addCommentFromSocket(data.postId, data.comment);
      }
    });

    newSocket.on('post-deleted', (data) => {
      removePostFromSocket(data.postId);
    });

    newSocket.on('disconnect', () => {
      // Handle disconnect
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave-event-channel', eventId);
        newSocket.disconnect();
      }
    };
  }, [channel, user, eventId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Loading state
  if (isLoading && !channel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
            <SparklesIcon className="w-8 h-8 text-teal-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Đang tải kênh trao đổi...</p>
          <p className="mt-2 text-sm text-gray-500">Vui lòng chờ một chút</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (accessDenied || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 px-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 mb-6">
            <ExclamationCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Không thể truy cập kênh
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error || 'Bạn không có quyền truy cập kênh trao đổi này. Vui lòng kiểm tra lại hoặc đăng ký tham gia sự kiện.'}
          </p>
          <button
            onClick={handleGoBack}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // No channel
  if (!channel) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="mb-6 flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại sự kiện
          </button>
          
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-8 py-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm mr-4">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {channel.event?.title}
                  </h1>
                  <p className="text-teal-100 mt-1">
                    Kênh trao đổi dành cho người tham gia sự kiện
                  </p>
                </div>
              </div>
            </div>
            
            {/* Channel Stats */}
            <div className="px-8 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-t border-teal-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span className="text-gray-600">Bài viết:</span>
                    <span className="ml-2 font-bold text-teal-600">{posts.length}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-gray-600">Đang hoạt động</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Creator */}
        {user && channel && (
          <PostCreator channelId={channel.id} />
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 mb-6">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-600 mb-1">
                Kênh này vẫn còn trống
              </p>
              {user && (
                <p className="text-sm text-teal-600 font-semibold">
                  Hãy là người đầu tiên chia sẻ! ✨
                </p>
              )}
            </div>
          )}
        </div>

        {/* Loading More */}
        {isLoading && posts.length > 0 && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-200 border-t-teal-600"></div>
              <span className="text-sm font-medium text-gray-600">Đang tải thêm...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelView;