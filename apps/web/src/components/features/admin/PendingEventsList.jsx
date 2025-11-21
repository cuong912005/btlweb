import React, { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, MapPin, Users, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import useAdminStore from '../../../stores/adminStore';

const PendingEventsList = () => {
  const { pendingEvents, selectedEvents, toggleEventSelection, selectAllEvents, clearSelection, isLoading } = useAdminStore();
  const [expandedEvent, setExpandedEvent] = useState(null);

  const isAllSelected = pendingEvents.length > 0 && selectedEvents.length === pendingEvents.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllEvents();
    }
  };

  const toggleExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (pendingEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không có sự kiện chờ phê duyệt
        </h3>
        <p className="text-gray-500">
          Tất cả sự kiện đã được xử lý
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Select All Checkbox */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50 p-5 rounded-2xl border-2 border-teal-100 shadow-sm">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
          />
          <span className="ml-3 text-sm font-bold text-gray-700">
            {isAllSelected ? '✅ Bỏ chọn tất cả' : '☑️ Chọn tất cả'}
          </span>
        </label>
        {selectedEvents.length > 0 && (
          <span className="text-sm font-semibold text-teal-700 bg-white px-4 py-1.5 rounded-xl border-2 border-teal-200">
            🎯 Đã chọn {selectedEvents.length}/{pendingEvents.length} sự kiện
          </span>
        )}
      </div>

      {/* Events List */}
      {pendingEvents.map((event) => (
        <div
          key={event.id}
          className={`bg-white/95 backdrop-blur-sm border-2 rounded-2xl shadow-lg hover:shadow-2xl transition-all ${
            selectedEvents.includes(event.id) ? 'border-teal-500 ring-4 ring-teal-100' : 'border-gray-200'
          }`}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Checkbox and Event Info */}
              <div className="flex items-start space-x-4 flex-1">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event.id)}
                  onChange={() => toggleEventSelection(event.id)}
                  className="mt-1 h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {event.location}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {event.capacity ? `${event.capacity} người` : 'Không giới hạn'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(event.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Chờ phê duyệt
                    </span>
                    <span className="text-sm text-gray-600">
                      Người tổ chức: {event.organizer?.firstName} {event.organizer?.lastName}
                    </span>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpand(event.id)}
                    className="mt-4 px-4 py-2 text-sm bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 font-semibold shadow-md transition-all transform hover:scale-105"
                  >
                    {expandedEvent === event.id ? '👆 Thu gọn' : '👇 Xem chi tiết'}
                  </button>

                  {/* Expanded Details */}
                  {expandedEvent === event.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Mô tả sự kiện:</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {event.description}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Danh mục:</span>
                          <span className="ml-2 text-gray-600">{event.category}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email người tổ chức:</span>
                          <span className="ml-2 text-gray-600">{event.organizer?.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingEventsList;
