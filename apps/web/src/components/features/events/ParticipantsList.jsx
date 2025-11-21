import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import api from '../../../utils/api';
import { showError, showWarning } from '../../../utils/toast';

const ParticipantsList = ({ participants, eventId, onUpdate }) => {
  const [loading, setLoading] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingParticipant, setRejectingParticipant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Handle single participant status update
  const handleUpdateStatus = async (participantId, status, reason = null) => {
    setLoading(prev => ({ ...prev, [participantId]: true }));
    
    try {
      await api.patch(`/events/participants/${participantId}/status`, {
        status,
        reason
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating participant status:', error);
      showError(error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setLoading(prev => ({ ...prev, [participantId]: false }));
    }
  };

  // Handle bulk status update
  const handleBulkUpdate = async (status, reason = null) => {
    if (selectedParticipants.length === 0) return;

    try {
      await api.patch('/events/participants/bulk-status', {
        participantIds: selectedParticipants,
        status,
        reason
      });
      
      setSelectedParticipants([]);
      onUpdate();
    } catch (error) {
      console.error('Error bulk updating participants:', error);
      showError(error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật hàng loạt');
    }
  };

  // Handle reject with reason
  const handleReject = (participantId) => {
    setRejectingParticipant(participantId);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      showWarning('Vui lòng nhập lý do từ chối');
      return;
    }

    await handleUpdateStatus(rejectingParticipant, 'REJECTED', rejectionReason);
    setShowRejectModal(false);
    setRejectingParticipant(null);
    setRejectionReason('');
  };

  // Handle selection
  const handleSelectAll = () => {
    const eligibleParticipants = filteredParticipants.filter(p => p.status === 'PENDING');
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

  // Filter participants
  const filteredParticipants = participants.filter(participant => {
    if (filterStatus === 'all') return true;
    return participant.status === filterStatus;
  });

  // Get status styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIconSolid className="h-3 w-3 mr-1" />
            Đã phê duyệt
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircleIconSolid className="h-3 w-3 mr-1" />
            Hoàn thành
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = participants.filter(p => p.status === 'PENDING').length;
  const eligibleForBulk = filteredParticipants.filter(p => p.status === 'PENDING');

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách người tham gia
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý và phê duyệt người tham gia sự kiện
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'all', label: 'Tất cả', count: participants.length },
              { id: 'PENDING', label: 'Chờ duyệt', count: participants.filter(p => p.status === 'PENDING').length },
              { id: 'APPROVED', label: 'Đã duyệt', count: participants.filter(p => p.status === 'APPROVED').length },
              { id: 'COMPLETED', label: 'Hoàn thành', count: participants.filter(p => p.status === 'COMPLETED').length },
              { id: 'REJECTED', label: 'Từ chối', count: participants.filter(p => p.status === 'REJECTED').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterStatus(tab.id);
                  setSelectedParticipants([]);
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {eligibleForBulk.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedParticipants.length === eligibleForBulk.length}
                onChange={handleSelectAll}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                {selectedParticipants.length > 0 
                  ? `Đã chọn ${selectedParticipants.length} người` 
                  : 'Chọn tất cả'
                }
              </span>
            </div>
            
            {selectedParticipants.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkUpdate('APPROVED')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Phê duyệt ({selectedParticipants.length})
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Nhập lý do từ chối:');
                    if (reason) handleBulkUpdate('REJECTED', reason);
                  }}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Từ chối ({selectedParticipants.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="divide-y divide-gray-200">
        {filteredParticipants.length > 0 ? (
          filteredParticipants.map((participant) => (
            <div key={participant.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {participant.status === 'PENDING' && (
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={() => handleSelectParticipant(participant.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-4"
                    />
                  )}
                  
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {participant.volunteer.avatar ? (
                        <img
                          src={participant.volunteer.avatar}
                          alt=""
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        {participant.volunteer.firstName} {participant.volunteer.lastName}
                      </h3>
                      <div className="ml-2">
                        {getStatusBadge(participant.status)}
                      </div>
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                        {participant.volunteer.email}
                      </div>
                      {participant.volunteer.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {participant.volunteer.phone}
                        </div>
                      )}
                      {participant.volunteer.location && (
                        <div className="flex items-center">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {participant.volunteer.location}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500">
                      Đăng ký: {new Date(participant.registeredAt).toLocaleDateString('vi-VN')}
                      {participant.completedAt && (
                        <span className="ml-4">
                          Hoàn thành: {new Date(participant.completedAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    
                    {participant.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        <strong>Lý do từ chối:</strong> {participant.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {participant.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(participant.id, 'APPROVED')}
                        disabled={loading[participant.id]}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading[participant.id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                        ) : (
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                        )}
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => handleReject(participant.id)}
                        disabled={loading[participant.id]}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Từ chối
                      </button>
                    </>
                  )}
                  
                  {participant.status === 'APPROVED' && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                      Đã phê duyệt
                    </span>
                  )}
                  
                  {participant.status === 'COMPLETED' && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                      Đã hoàn thành
                    </span>
                  )}
                  
                  {participant.status === 'REJECTED' && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full">
                      Đã từ chối
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filterStatus === 'all' ? 'Chưa có người tham gia' : 'Không có người tham gia phù hợp'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'all' 
                ? 'Sự kiện chưa có ai đăng ký tham gia.'
                : 'Thử thay đổi bộ lọc để xem danh sách khác.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Xác nhận từ chối
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng nhập lý do từ chối người tham gia này:
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingParticipant(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmReject}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;