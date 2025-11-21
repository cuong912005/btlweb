import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useChannelStore } from '../../../stores/channelStore';
import {
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const PostCreator = ({ channelId }) => {
  const { user } = useAuthStore();
  const { createPost, uploadImage } = useChannelStore();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setSelectedImage(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedImage) {
      setError('Vui lòng nhập nội dung hoặc chọn hình ảnh');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        const uploadResult = await uploadImage(channelId, selectedImage);
        if (!uploadResult.success) {
          setError(uploadResult.error);
          setIsSubmitting(false);
          return;
        }
        imageUrl = uploadResult.imageUrl;
      }

      // Create post
      const result = await createPost(channelId, content, imageUrl);
      
      if (result.success) {
        // Clear form
        setContent('');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng bài viết');
      console.error('Post creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tạo bài viết mới
          </h3>
        </div>

        {/* Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì về sự kiện này?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={4}
          disabled={isSubmitting}
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4 relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Image Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              <PhotoIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Thêm ảnh</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !selectedImage)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreator;