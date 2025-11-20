import { toast } from 'react-toastify';

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn bổ sung cho toast
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

/**
 * Hiển thị thông báo lỗi
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn bổ sung cho toast
 */
export const showError = (message, options = {}) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn bổ sung cho toast
 */
export const showWarning = (message, options = {}) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

/**
 * Hiển thị thông báo thông tin
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn bổ sung cho toast
 */
export const showInfo = (message, options = {}) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

/**
 * Hiển thị toast với promise (loading -> success/error)
 * @param {Promise} promise - Promise để theo dõi
 * @param {object} messages - Các thông báo cho pending, success, error
 */
export const showPromise = (promise, messages = {}) => {
  return toast.promise(
    promise,
    {
      pending: messages.pending || 'Đang xử lý...',
      success: messages.success || 'Thành công!',
      error: messages.error || 'Đã xảy ra lỗi!'
    },
    {
      position: "top-right",
      autoClose: 3000
    }
  );
};

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  promise: showPromise
};
