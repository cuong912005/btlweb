import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEvents } from '../../../stores/eventStore';
import { useAuthStore } from '../../../stores/authStore';

// Validation schema
const eventSchema = yup.object({
  title: yup
    .string()
    .required('Tiêu đề sự kiện là bắt buộc')
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  
  description: yup
    .string()
    .required('Mô tả sự kiện là bắt buộc')
    .min(20, 'Mô tả phải có ít nhất 20 ký tự')
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự'),
  
  category: yup
    .string()
    .required('Danh mục sự kiện là bắt buộc'),
  
  location: yup
    .string()
    .required('Địa điểm tổ chức là bắt buộc')
    .min(5, 'Địa điểm phải có ít nhất 5 ký tự')
    .max(500, 'Địa điểm không được vượt quá 500 ký tự'),
  
  startDate: yup
    .date()
    .required('Ngày bắt đầu là bắt buộc')
    .min(new Date(), 'Ngày bắt đầu phải trong tương lai'),
  
  endDate: yup
    .date()
    .required('Ngày kết thúc là bắt buộc')
    .min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  
  capacity: yup
    .number()
    .min(1, 'Số lượng tham gia phải lớn hơn 0')
    .max(10000, 'Số lượng tham gia không được vượt quá 10,000')
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
});

const EventCreationForm = () => {
  const { createEvent, isLoading, error, clearError, categories } = useEvents();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      capacity: 50
    }
  });

  // Check if user has permission to create events
  if (user?.role !== 'ORGANIZER') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Không có quyền truy cập
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Chỉ có tài khoản tổ chức mới có thể tạo sự kiện. Vui lòng đăng ký tài khoản tổ chức hoặc liên hệ quản trị viên.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      // Format dates for API
      const eventData = {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        capacity: data.capacity || null
      };

      console.log('Sending event data:', eventData); // Debug log

      await createEvent(eventData);
      setSubmitSuccess(true);
      reset();
      
      // Show success alert
      alert('Tạo sự kiện thành công! Sự kiện của bạn đang chờ phê duyệt.');

      // Show success message for 3 seconds then clear
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Event creation failed:', err);
      // Make sure error is displayed to user
      if (err.response?.data?.details) {
        // API returned validation details
        const errorDetails = err.response.data.details.join('\n');
        alert(`Lỗi validation:\n${errorDetails}`);
      } else if (err.response?.data?.error) {
        // API returned specific error message
        alert(`Lỗi: ${err.response.data.error}`);
      } else if (err.message) {
        // Network or other error
        alert(`Lỗi: ${err.message}`);
      } else {
        // Generic error
        alert('Có lỗi xảy ra khi tạo sự kiện. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch start date to set min end date
  const startDate = watch('startDate');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Tạo sự kiện thành công!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Sự kiện của bạn đã được tạo và đang chờ phê duyệt từ quản trị viên.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Đóng</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Tiêu đề sự kiện *
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="VD: Làm sạch bãi biển Vũng Tàu"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Danh mục *
              </label>
              <select
                id="category"
                {...register('category')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Mô tả sự kiện *
              </label>
              <textarea
                id="description"
                rows={6}
                {...register('description')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Mô tả chi tiết về sự kiện, mục đích, hoạt động sẽ thực hiện..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Time and Location */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thời gian và địa điểm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Ngày bắt đầu *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                {...register('startDate')}
                min={new Date().toISOString().slice(0, 16)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.startDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Ngày kết thúc *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                {...register('endDate')}
                min={startDate || new Date().toISOString().slice(0, 16)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.endDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Địa điểm tổ chức *
              </label>
              <input
                type="text"
                id="location"
                {...register('location')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="VD: Bãi biển Thùy Vân, Vũng Tàu, Bà Rịa - Vũng Tàu"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity and Requirements */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Yêu cầu tham gia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Số lượng tình nguyện viên tối đa *
              </label>
              <input
                type="number"
                id="capacity"
                {...register('capacity')}
                min="1"
                max="10000"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.capacity ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="50"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            Đặt lại
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Đang tạo...
              </>
            ) : (
              'Tạo sự kiện'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventCreationForm;