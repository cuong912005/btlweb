import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import useAdminStore from '../../../stores/adminStore';

const EventApprovalActions = ({ onSuccess }) => {
  const { selectedEvents, bulkApproval, clearSelection } = useAdminStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  const handleApprove = async () => {
    if (selectedEvents.length === 0) {
      setError('Vui lòng chọn ít nhất một sự kiện');
      return;
    }

    setIsProcessing(true);
    setError('');

    const result = await bulkApproval(selectedEvents, 'approve');
    
    setIsProcessing(false);

    if (result.success) {
      onSuccess?.(result.message || `Đã phê duyệt ${result.processedCount} sự kiện`);
    } else {
      setError(result.error);
    }
  };

  const handleReject = async () => {
    if (selectedEvents.length === 0) {
      setError('Vui lòng chọn ít nhất một sự kiện');
      return;
    }

    if (!rejectReason || rejectReason.trim().length < 10) {
      setError('Lý do từ chối phải có ít nhất 10 ký tự');
      return;
    }

    setIsProcessing(true);
    setError('');

    const result = await bulkApproval(selectedEvents, 'reject', rejectReason);
    
    setIsProcessing(false);

    if (result.success) {
      setShowRejectModal(false);
      setRejectReason('');
      onSuccess?.(result.message || `Đã từ chối ${result.processedCount} sự kiện`);
    } else {
      setError(result.error);
    }
  };

  const openRejectModal = () => {
    if (selectedEvents.length === 0) {
      setError('Vui lòng chọn ít nhất một sự kiện');
      return;
    }
    setShowRejectModal(true);
    setError('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setError('');
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-2 border-teal-100">
      <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
        ⚙️ Hành động phê duyệt
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button
          onClick={handleApprove}
          disabled={isProcessing || selectedEvents.length === 0}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isProcessing ? (
            <Loader className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5 mr-2" />
          )}
          ✅ Phê duyệt ({selectedEvents.length})
        </button>

        <button
          onClick={openRejectModal}
          disabled={isProcessing || selectedEvents.length === 0}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          <XCircle className="h-5 w-5 mr-2" />
          ❌ Từ chối ({selectedEvents.length})
        </button>

        {selectedEvents.length > 0 && (
          <button
            onClick={clearSelection}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            🗑️ Bỏ chọn
          </button>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-red-100 shadow-2xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
              ❌ Từ chối sự kiện
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Bạn đang từ chối {selectedEvents.length} sự kiện. Vui lòng nhập lý do từ chối:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all"
            />

            {error && (
              <p className="mt-2 text-sm text-red-600 font-semibold">
                {error}
              </p>
            )}

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  'Xác nhận từ chối'
                )}
              </button>
              <button
                onClick={closeRejectModal}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventApprovalActions;
