import React, { useState } from 'react';
import { 
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  TagIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const EventFilters = ({
  filters,
  onFilterChange,
  categories
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };
  
  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      availability: 'all',
      eventStatus: 'all',
      registrationStatus: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.category || 
           filters.location || 
           filters.startDate || 
           filters.endDate ||
           (filters.availability && filters.availability !== 'all') ||
           (filters.eventStatus && filters.eventStatus !== 'all') ||
           (filters.registrationStatus && filters.registrationStatus !== 'all');
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 sticky top-6">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
              {hasActiveFilters() && (
                <span className="text-xs text-indigo-600 font-medium">Đang lọc</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-6 space-y-5">
        {/* Search */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            <MagnifyingGlassIcon className="h-4 w-4 inline mr-2" />
            Tìm kiếm
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleInputChange('search', e.target.value)}
              placeholder="Tìm sự kiện..."
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => handleInputChange('search', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            <TagIcon className="h-4 w-4 inline mr-2" />
            Danh mục
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="">Tất cả</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Location */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            <MapPinIcon className="h-4 w-4 inline mr-2" />
            Địa điểm
          </label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Nhập địa điểm..."
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
        
        {/* Date Range */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            <CalendarIcon className="h-4 w-4 inline mr-2" />
            Thời gian
          </label>
          <div className="space-y-3">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              placeholder="Từ ngày"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              min={filters.startDate || ''}
              placeholder="Đến ngày"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>
        </div>
        
        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            <UsersIcon className="h-4 w-4 inline mr-2" />
            Tình trạng
          </label>
          <select
            value={filters.availability || 'all'}
            onChange={(e) => handleInputChange('availability', e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="all">Tất cả</option>
            <option value="available">Còn chỗ</option>
            <option value="full">Đã đầy</option>
          </select>
        </div>
        
        {/* Registration Status Filter - NEW PROMINENT FILTER */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4 border-2 border-teal-200">
          <label className="block text-sm font-bold text-teal-900 mb-3">
            <svg className="h-5 w-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            🎯 Có thể đăng ký
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="registrationStatus"
                value="all"
                checked={!filters.registrationStatus || filters.registrationStatus === 'all'}
                onChange={(e) => handleInputChange('registrationStatus', e.target.value)}
                className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-teal-700">Tất cả sự kiện</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="registrationStatus"
                value="available"
                checked={filters.registrationStatus === 'available'}
                onChange={(e) => handleInputChange('registrationStatus', e.target.value)}
                className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <span className="ml-3 text-sm font-medium text-teal-700 group-hover:text-teal-800">✅ Chỉ sự kiện có thể đăng ký</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="registrationStatus"
                value="unavailable"
                checked={filters.registrationStatus === 'unavailable'}
                onChange={(e) => handleInputChange('registrationStatus', e.target.value)}
                className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-gray-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-gray-700">❌ Đã kết thúc / đầy chỗ</span>
            </label>
          </div>
        </div>
        
        {/* Event Status Filter */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            <CalendarIcon className="h-4 w-4 inline mr-2" />
            Trạng thái
          </label>
          <select
            value={filters.eventStatus || 'all'}
            onChange={(e) => handleInputChange('eventStatus', e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="all">Tất cả</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ongoing">Đang diễn ra</option>
            <option value="past">Đã kết thúc</option>
          </select>
        </div>
        
        {/* Clear Filters */}
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
};

export default EventFilters;