import React, { useState } from 'react';
import { 
  StarIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../../../utils/api';

const EventRating = ({ event, eventId, eventTitle, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Determine event data from props - support both patterns
  const eventData = event?.event || { id: eventId, title: eventTitle };
  const participationId = event?.id;

  // Handle star click
  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  // Handle star hover
  const handleStarHover = (starValue) => {
    setHoverRating(starValue);
  };

  // Handle star hover leave
  const handleStarLeave = () => {
    setHoverRating(0);
  };

  // Get star display value (hover takes priority over selected)
  const getStarValue = (starIndex) => {
    return hoverRating > 0 ? hoverRating : rating;
  };

  // Submit rating
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Always make the API call directly
      const response = await api.post(`/events/${eventData.id}/rate`, {
        rating,
        feedback: feedback.trim() || undefined
      });

      if (response.data.success) {
        // Call onSuccess callback if provided (for parent component to refresh data)
        if (onSuccess) {
          onSuccess(eventData.id, rating, feedback.trim());
        }
        onClose();
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.response?.data?.error || 'Lỗi khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rating descriptions
  const getRatingDescription = (stars) => {
    switch (stars) {
      case 1:
        return 'Rất không hài lòng';
      case 2:
        return 'Không hài lòng';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Hài lòng';
      case 5:
        return 'Rất hài lòng';
      default:
        return 'Chọn đánh giá của bạn';
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Đánh giá sự kiện
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {eventData.title}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              {eventData.startDate && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {new Date(eventData.startDate).toLocaleDateString('vi-VN')}
                </div>
              )}
              {eventData.location && (
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {eventData.location}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Bạn đánh giá sự kiện này như thế nào?
              </label>
              
              <div className="flex items-center justify-center space-x-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= getStarValue(star);
                  const StarComponent = isFilled ? StarIconSolid : StarIcon;
                  
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                      disabled={isSubmitting}
                    >
                      <StarComponent
                        className={`h-8 w-8 ${
                          isFilled 
                            ? 'text-yellow-400' 
                            : 'text-gray-300 hover:text-yellow-300'
                        } transition-colors`}
                      />
                    </button>
                  );
                })}
              </div>
              
              <p className="text-center text-sm text-gray-600">
                {getRatingDescription(displayRating)}
              </p>
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét (không bắt buộc)
              </label>
              <textarea
                id="feedback"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này..."
                maxLength={500}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {feedback.length}/500 ký tự
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 px-4 py-2 border border-transparent text-white text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang gửi...
                  </div>
                ) : (
                  'Gửi đánh giá'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventRating;