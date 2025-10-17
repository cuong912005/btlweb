import React, { useState } from 'react';
import { 
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  TagIcon,
  MapPinIcon,
  CalendarIcon
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
      endDate: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.category || 
           filters.location || 
           filters.startDate || 
           filters.endDate;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
            {hasActiveFilters() && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Đang lọc
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`p-4 space-y-4 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
            Tìm kiếm
          </label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Tìm kiếm sự kiện..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TagIcon className="h-4 w-4 inline mr-1" />
            Danh mục
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="h-4 w-4 inline mr-1" />
            Địa điểm
          </label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Nhập địa điểm..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="h-4 w-4 inline mr-1" />
            Thời gian
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={filters.startDate || ''}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Clear Filters */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={clearAllFilters}
              className="w-full text-sm text-gray-500 hover:text-gray-700 text-center py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Summary (Mobile) */}
      {hasActiveFilters() && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                "{filters.search}"
                <button
                  onClick={() => handleInputChange('search', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.category}
                <button
                  onClick={() => handleInputChange('category', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {filters.location}
                <button
                  onClick={() => handleInputChange('location', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.startDate || filters.endDate) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {filters.startDate && filters.endDate 
                  ? `${filters.startDate} - ${filters.endDate}`
                  : filters.startDate 
                    ? `Từ ${filters.startDate}`
                    : `Đến ${filters.endDate}`
                }
                <button
                  onClick={() => {
                    handleInputChange('startDate', '');
                    handleInputChange('endDate', '');
                  }}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFilters;