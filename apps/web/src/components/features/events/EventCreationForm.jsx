import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEvents } from '../../../stores/eventStore';
import { useAuthStore } from '../../../stores/authStore';
import { showSuccess, showError } from '../../../utils/toast';

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
      reset();
      
      showSuccess('Tạo sự kiện thành công! Sự kiện của bạn đang chờ phê duyệt.');

    } catch (err) {
      console.error('Event creation failed:', err);
      // Make sure error is displayed to user
      if (err.response?.data?.details) {
        // API returned validation details
        const errorDetails = err.response.data.details.join('\n');
        showError(`Lỗi validation:\n${errorDetails}`);
      } else if (err.response?.data?.error) {
        // API returned specific error message
        showError(`Lỗi: ${err.response.data.error}`);
      } else if (err.message) {
        // Network or other error
        showError(`Lỗi: ${err.message}`);
      } else {
        // Generic error
        showError('Có lỗi xảy ra khi tạo sự kiện. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch start date to set min end date
  const startDate = watch('startDate');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-gradient-to-br from-white to-teal-50/30 rounded-2xl p-8 shadow-lg border border-teal-100">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Thông tin cơ bản
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {/* Event Title */}
            <div className="group">
              <label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tiêu đề sự kiện
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  className={`block w-full rounded-xl border-2 ${
                    errors.title 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500'
                  } shadow-sm px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-offset-0 transition-all sm:text-sm group-hover:border-teal-300`}
                  placeholder="VD: Làm sạch bãi biển Vũng Tàu"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 ${errors.title ? 'text-red-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="group">
              <label htmlFor="category" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Danh mục
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  {...register('category')}
                  className={`block w-full rounded-xl border-2 ${
                    errors.category 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500'
                  } shadow-sm px-4 py-3 text-gray-900 focus:ring-2 focus:ring-offset-0 transition-all sm:text-sm group-hover:border-teal-300`}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="group">
              <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Mô tả sự kiện
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                {...register('description')}
                className={`block w-full rounded-xl border-2 ${
                  errors.description 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500'
                } shadow-sm px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-offset-0 transition-all sm:text-sm group-hover:border-teal-300 resize-none`}
                placeholder="Mô tả chi tiết về sự kiện, mục đích, hoạt động sẽ thực hiện, lợi ích khi tham gia..."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Mô tả chi tiết giúp thu hút nhiều tình nguyện viên hơn
              </p>
            </div>
          </div>
        </div>

        {/* Time and Location Section */}
        <div className="bg-gradient-to-br from-white to-cyan-50/30 rounded-2xl p-8 shadow-lg border border-cyan-100">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Thời gian và địa điểm
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="group">
              <label htmlFor="startDate" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ngày bắt đầu
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="datetime-local"
                id="startDate"
                {...register('startDate')}
                min={new Date().toISOString().slice(0, 16)}
                className={`block w-full rounded-xl border-2 ${
                  errors.startDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500'
                } shadow-sm px-4 py-3 text-gray-900 focus:ring-2 focus:ring-offset-0 transition-all sm:text-sm group-hover:border-cyan-300`}
              />
              {errors.startDate && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="group">
              <label htmlFor="endDate" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ngày kết thúc
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="datetime-local"
                id="endDate"
                {...register('endDate')}
                min={startDate || new Date().toISOString().slice(0, 16)}
                className={`block w-full rounded-xl border-2 ${
                  errors.endDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500'
                } shadow-sm px-4 py-3 text-gray-900 focus:ring-2 focus:ring-offset-0 transition-all sm:text-sm group-hover:border-cyan-300`}
              />
              {errors.endDate && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.endDate.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="md:col-span-2 group">
              <label htmlFor="location" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Địa điểm tổ chức
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  {...register('location')}
                  className={`block w-full rounded-xl border-2 ${
                    errors.location 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500'
                  } shadow-sm px-4 py-3 pl-10 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-offset-0 transition-all sm:text-sm group-hover:border-cyan-300`}
                  placeholder="VD: Bãi biển Thùy Vân, Vũng Tàu, Bà Rịa - Vũng Tàu"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
              </div>
              {errors.location && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity Section */}
        <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl p-8 shadow-lg border border-amber-100">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Yêu cầu tham gia
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capacity */}
            <div className="group">
              <label htmlFor="capacity" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Số lượng tình nguyện viên
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="capacity"
                  {...register('capacity')}
                  min="1"
                  max="10000"
                  className={`block w-full rounded-xl border-2 ${
                    errors.capacity 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-amber-500 focus:ring-amber-500'
                  } shadow-sm px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-offset-0 transition-all sm:text-sm group-hover:border-amber-300`}
                  placeholder="50"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400 text-sm">người</span>
                </div>
              </div>
              {errors.capacity && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.capacity.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Số lượng tối đa có thể tham gia
              </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-white py-3 px-6 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
            disabled={isSubmitting}
          >
            Đặt lại
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex justify-center py-3 px-8 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
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