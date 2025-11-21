import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon,
  CalendarIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const DashboardPostCard = ({ post, variant = 'default' }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleClick = () => {
    navigate(`/events/${post.event.id}/channel`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Môi trường': 'bg-green-100 text-green-800',
      'Giáo dục': 'bg-blue-100 text-blue-800',
      'Y tế': 'bg-red-100 text-red-800',
      'Cộng đồng': 'bg-purple-100 text-purple-800',
      'Từ thiện': 'bg-yellow-100 text-yellow-800',
      'Cứu trợ thiên tai': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div 
      onClick={handleClick}
      className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-teal-200 group transform hover:-translate-y-1"
    >
      {/* Gradient accent - different for trending */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${variant === 'trending' ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-gradient-to-r from-teal-500 to-cyan-600'}`}></div>
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Author Avatar with gradient ring */}
            {post.author?.avatar ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full animate-pulse opacity-50"></div>
                <img 
                  src={post.author.avatar} 
                  alt={`${post.author.firstName} ${post.author.lastName}`}
                  className="relative h-11 w-11 rounded-full ring-2 ring-white"
                />
              </div>
            ) : (
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-sm font-bold text-white">
                  {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                </span>
              </div>
            )}

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {post.author?.firstName} {post.author?.lastName}
              </p>
              <p className="text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Trending Badge */}
          {variant === 'trending' && (
            <div className="flex items-center text-xs text-white bg-gradient-to-r from-orange-500 to-amber-600 px-3 py-1 rounded-full ml-2 flex-shrink-0 shadow-md animate-pulse">
              <FireIcon className="h-3 w-3 mr-1" />
              Hot
            </div>
          )}
        </div>

        {/* Post Content */}
        <p className="text-sm text-gray-800 mb-4 line-clamp-3 leading-relaxed">
          {post.content}
        </p>

        {/* Post Image with hover effect */}
        {post.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden shadow-md group/image">
            <img 
              src={post.imageUrl} 
              alt="Post content"
              className="w-full h-48 object-cover transform transition-transform duration-500 group-hover/image:scale-110"
            />
          </div>
        )}

        {/* Event Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.event?.category)} shadow-sm`}>
            <CalendarIcon className="h-3 w-3 mr-1.5" />
            {post.event?.title}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
          <div className="flex items-center space-x-5">
            <div className="flex items-center text-sm font-semibold text-gray-700">
              <HeartIcon className="h-4 w-4 mr-1.5 text-red-500" />
              <span>{post.likeCount || 0}</span>
            </div>
            <div className="flex items-center text-sm font-semibold text-gray-700">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1.5 text-teal-500" />
              <span>{post.commentCount || 0}</span>
            </div>
          </div>

          {/* Engagement Score for trending posts */}
          {variant === 'trending' && post.engagementScore !== undefined && (
            <div className="text-sm font-semibold">
              <span className="text-gray-600">Score: </span>
              <span className="text-orange-600 text-base">{post.engagementScore}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPostCard;
