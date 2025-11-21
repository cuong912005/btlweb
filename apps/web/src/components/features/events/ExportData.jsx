import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon,
  XMarkIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../../utils/api';

const ExportData = ({ type, onClose, eventId = null }) => {
  const [format, setFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // success, error, null
  const [statusMessage, setStatusMessage] = useState('');

  // Export type configurations
  const exportConfigs = {
    'participation-history': {
      title: 'Xuất lịch sử tham gia',
      description: 'Tải về dữ liệu về tất cả các sự kiện bạn đã tham gia',
      endpoint: '/events/volunteers/participation-history/export',
      filename: 'lich-su-tham-gia'
    },
    'event-participants': {
      title: 'Xuất danh sách người tham gia',
      description: 'Tải về danh sách tất cả người tham gia sự kiện',
      endpoint: `/events/${eventId}/participants/export`,
      filename: 'danh-sach-tham-gia'
    },
    'volunteer-stats': {
      title: 'Xuất thống kê tình nguyện',
      description: 'Tải về báo cáo thống kê chi tiết về hoạt động tình nguyện',
      endpoint: '/events/volunteers/stats/export',
      filename: 'thong-ke-tinh-nguyen'
    }
  };

  const config = exportConfigs[type] || exportConfigs['participation-history'];

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);
    setStatusMessage('');

    try {
      const response = await api.get(`${config.endpoint}?format=${format}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${config.filename}-${timestamp}.${format}`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportStatus('success');
      setStatusMessage(`Tệp ${filename} đã được tải về thành công!`);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Export error:', err);
      setExportStatus('error');
      setStatusMessage(
        err.response?.data?.error || 
        'Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Format options
  const formatOptions = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Định dạng bảng tính, mở được bằng Excel',
      icon: TableCellsIcon,
      recommended: true
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Định dạng dữ liệu có cấu trúc, dành cho developers',
      icon: DocumentTextIcon,
      recommended: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {config.title}
          </h2>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="text-sm text-gray-600 mb-6">
            {config.description}
          </p>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn định dạng tệp:
            </label>
            <div className="space-y-3">
              {formatOptions.map((option) => (
                <div
                  key={option.id}
                  className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    format === option.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setFormat(option.id)}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="format"
                      value={option.id}
                      checked={format === option.id}
                      onChange={() => setFormat(option.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <option.icon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {option.name}
                      </span>
                      {option.recommended && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Khuyến nghị
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <DocumentArrowDownIcon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Thông tin tệp</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="space-y-1">
                    <li>• Định dạng: {format.toUpperCase()}</li>
                    <li>• Mã hóa: UTF-8</li>
                    <li>• Kích thước: Phụ thuộc vào dữ liệu</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {exportStatus && (
            <div className={`mb-4 p-3 rounded-md ${
              exportStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {exportStatus === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    exportStatus === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {statusMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-2 border border-transparent text-white text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Đang xuất...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Tải về
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;