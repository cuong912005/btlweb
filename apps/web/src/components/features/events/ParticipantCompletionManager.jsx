import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import api from '../../../utils/api';
import { showError, showWarning } from '../../../utils/toast';

const ParticipantCompletionManager = ({ participants, eventId, onUpdate }) => {
  const [loading, setLoading] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Filter participants who can be marked as completed
  const eligibleParticipants = participants.filter(p => 
    p.status === 'APPROVED' && 
    (p.canMarkCompleted || p.canUnmarkCompleted)
  );

  if (eligibleParticipants.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa thể đánh dấu hoàn thành
        </h3>
        <p className="text-sm text-gray-500">
          Chỉ có thể đánh dấu hoàn thành sau khi sự kiện kết thúc và có người tham gia được phê duyệt.
        </p>
      </div>
    );
  }

  // Handle single participant completion toggle
  const handleToggleCompletion = async (participantId, isCompleted) => {
    setLoading(prev => ({ ...prev, [participantId]: true }));
    
    try {
      await api.patch(`/events/participants/${participantId}/status`, {
        status: 'APPROVED', // Keep status as APPROVED
        isCompleted: !isCompleted // Toggle completion
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error toggling completion:', error);
      showError(error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setLoading(prev => ({ ...prev, [participantId]: false }));
    }
  };

  // Handle bulk completion
  const handleBulkCompletion = async (isCompleted) => {
    if (selectedParticipants.length === 0) {
      showWarning('Vui lòng chọn ít nhất một người tham gia');
      return;
    }

    setLoading(prev => ({ ...prev, bulk: true }));
    
    try {
      await api.patch(`/events/participants/bulk-status`, {
        participantIds: selectedParticipants,
        status: 'APPROVED', // Keep status as APPROVED
        isCompleted // Set completion status
      });
      
      setSelectedParticipants([]);
      onUpdate();
    } catch (error) {
      console.error('Error bulk updating completion:', error);
      showError(error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật hàng loạt');
    } finally {
      setLoading(prev => ({ ...prev, bulk: false }));
    }
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (selectedParticipants.length === eligibleParticipants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(eligibleParticipants.map(p => p.id));
    }
  };

  const handleSelectParticipant = (participantId) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const completedCount = eligibleParticipants.filter(p => p.isCompleted).length;
  const notCompletedCount = eligibleParticipants.length - completedCount;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý hoàn thành tham gia
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Đánh dấu những người tham gia đã hoàn thành sự kiện
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <CheckCircleIconSolid className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-700">{completedCount} hoàn thành</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-orange-700">{notCompletedCount} chưa hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {eligibleParticipants.length > 1 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedParticipants.length === eligibleParticipants.length}
                onChange={handleSelectAll}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Chọn tất cả ({selectedParticipants.length}/{eligibleParticipants.length})
              </label>
            </div>
            
            {selectedParticipants.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkCompletion(true)}
                  disabled={loading.bulk}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Đánh dấu hoàn thành
                </button>
                <button
                  onClick={() => handleBulkCompletion(false)}
                  disabled={loading.bulk}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Bỏ đánh dấu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="space-y-3">
        {eligibleParticipants.map((participant) => (
          <div 
            key={participant.id}
            className={`flex items-center justify-between p-4 border rounded-lg ${
              participant.isCompleted 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              {eligibleParticipants.length > 1 && (
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(participant.id)}
                  onChange={() => handleSelectParticipant(participant.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              )}
              
              <div className="flex-shrink-0">
                {participant.isCompleted ? (
                  <CheckCircleIconSolid className="h-6 w-6 text-green-500" />
                ) : (
                  <ClockIcon className="h-6 w-6 text-orange-500" />
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {participant.volunteer.firstName} {participant.volunteer.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {participant.volunteer.email}
                </p>
                {participant.completedAt && (
                  <p className="text-xs text-green-600">
                    Hoàn thành: {new Date(participant.completedAt).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => handleToggleCompletion(participant.id, participant.isCompleted)}
              disabled={loading[participant.id]}
              className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md disabled:opacity-50 ${
                participant.isCompleted
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                  : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
              }`}
            >
              {loading[participant.id] ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : participant.isCompleted ? (
                <XCircleIcon className="h-4 w-4 mr-1" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 mr-1" />
              )}
              {participant.isCompleted ? 'Bỏ đánh dấu' : 'Đánh dấu hoàn thành'}
            </button>
          </div>
        ))}
      </div>

      {/* Info Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Lưu ý</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Chỉ những người tham gia được phê duyệt mới có thể đánh dấu hoàn thành</li>
                <li>Người tham gia được đánh dấu hoàn thành mới có thể đánh giá sự kiện</li>
                <li>Trạng thái này sẽ ảnh hưởng đến thống kê hoạt động tình nguyện</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCompletionManager;