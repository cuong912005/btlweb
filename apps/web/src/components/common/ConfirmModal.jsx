import React from 'react';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'warning', // 'warning', 'info', 'success', 'danger'
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600" />;
      case 'danger':
        return <XCircleIcon className="h-12 w-12 text-red-600" />;
      case 'success':
        return <CheckCircleIcon className="h-12 w-12 text-green-600" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-12 w-12 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'danger':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getColors();

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Section */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${colors.bg} mb-4`}>
            {getIcon()}
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h3>
          
          {/* Message */}
          <div className="text-gray-600 text-base leading-relaxed">
            {message}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 text-base font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 ${colors.button} text-white text-base font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;