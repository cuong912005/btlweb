import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useChannelStore } from '../../../stores/channelStore';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { showError } from '../../../utils/toast';
import ConfirmModal from '../../common/ConfirmModal';
import { useConfirm } from '../../../hooks/useConfirm';

const PostCard = ({ post }) => {
  const { user } = useAuthStore();
  const { toggleLike, addComment, deletePost, permissions } = useChannelStore();
  const { isOpen, config, confirm, close } = useConfirm();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // User can delete if they are the author, admin, or have moderation permissions
  const canDelete = user && (
    user.id === post.author.id || 
    user.role === 'ADMIN' || 
    permissions?.canModerate
  );

  const handleLike = async () => {
    if (!user) {
      showError('Vui lòng đăng nhập để thích bài viết');
      return;
    }
    if (isLiking) return; // Prevent double-click
    
    setIsLiking(true);
    try {
      await toggleLike(post.id);
    } finally {
      setTimeout(() => setIsLiking(false), 500); // Debounce 500ms
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addComment(post.id, commentText);
      if (result.success) {
        setCommentText('');
      } else {
        showError(result.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Xóa bài viết',
      message: 'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'danger'
    });
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deletePost(post.id);
      if (!result.success) {
        showError(result.error);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Check if user has liked this post (support both property names from API)
  const isLiked = post.isLikedByUser || post.isLiked || false;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 mb-6 border border-gray-100 group">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Gradient Avatar with Pulse Ring */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full animate-pulse opacity-75"></div>
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-white">
              {post.author.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={`${post.author.firstName} ${post.author.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{post.author.firstName?.[0]}{post.author.lastName?.[0]}</span>
              )}
            </div>
          </div>

          {/* Author Info */}
          <div>
            <h4 className="font-bold text-gray-900 text-lg flex items-center">
              {post.author.firstName} {post.author.lastName}
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700">
                {post.author.roleInEvent === 'ORGANIZER' ? '🎯 Tổ chức' : '🌟 Tình nguyện viên'}
              </span>
            </h4>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Delete Button */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 transform hover:scale-110"
            title="Xóa bài viết"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Image with Effects */}
      {post.imageUrl && (
        <div className="mb-6 rounded-2xl overflow-hidden shadow-xl group/image relative">
          {/* Loading Spinner */}
          {!imageLoaded && (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
              <SparklesIcon className="w-12 h-12 text-gray-400 animate-spin" />
            </div>
          )}
          
          {/* Image with Hover Scale */}
          <img 
            src={post.imageUrl} 
            alt="Post image" 
            className={`w-full h-auto max-h-96 object-cover cursor-pointer transform transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover/image:scale-105`}
            onLoad={() => setImageLoaded(true)}
            onClick={() => setShowFullImage(true)}
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      )}

      {/* Full-screen Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img 
              src={post.imageUrl} 
              alt="Full size" 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transform hover:scale-110 transition-all"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Post Stats & Action Buttons */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-6">
          {/* Like Button with Gradient */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all transform hover:scale-105 disabled:opacity-70 ${
              isLiked 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg' 
                : 'bg-gray-100 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 text-gray-700'
            } ${isLiking ? 'animate-pulse' : ''}`}
          >
            {isLiked ? (
              <HeartIconSolid className={`w-5 h-5 ${isLiking ? 'animate-bounce' : ''}`} />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="font-semibold">{post.likeCount || 0}</span>
          </button>

          {/* Comment Button with Gradient */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-100 to-cyan-100 hover:from-teal-200 hover:to-cyan-200 text-teal-700 transition-all transform hover:scale-105"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="font-semibold">{post.comments?.length || post.commentCount || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section with Animations */}
      {showComments && (
        <div className="space-y-4 animate-slideDown">
          {/* Comment Input Form */}
          {user && (
            <form onSubmit={handleAddComment} className="flex items-start space-x-3 pb-4 border-b border-gray-200">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List with Gradient Bubbles */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.map((comment, index) => {
                // Support both comment.author and comment.user from API
                const commenter = comment.author || comment.user;
                return (
                  <div 
                    key={comment.id} 
                    className="flex items-start space-x-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {commenter?.avatar ? (
                          <img 
                            src={commenter.avatar} 
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{commenter?.firstName?.[0]}{commenter?.lastName?.[0]}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {commenter?.firstName} {commenter?.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-3">
                <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Chưa có bình luận nào</p>
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isOpen}
        onClose={close}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
        isLoading={config.isLoading}
      />
    </div>
  );
};

export default PostCard;