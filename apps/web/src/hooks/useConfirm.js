import { useState } from 'react';

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Xác nhận',
    message: 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ',
    type: 'warning',
    onConfirm: () => {},
    isLoading: false
  });

  const confirm = (options) => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || 'Xác nhận',
        message: options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy bỏ',
        type: options.type || 'warning',
        isLoading: false,
        onConfirm: () => {
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          resolve(false);
          setIsOpen(false);
        }
      });
      setIsOpen(true);
    });
  };

  const setLoading = (loading) => {
    setConfig(prev => ({ ...prev, isLoading: loading }));
  };

  const close = () => {
    if (!config.isLoading) {
      setIsOpen(false);
    }
  };

  return {
    isOpen,
    config,
    confirm,
    setLoading,
    close
  };
};