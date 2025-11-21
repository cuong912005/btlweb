import React, { useState } from 'react';
import { Download, FileText, Users, Loader } from 'lucide-react';
import useAdminStore from '../../../stores/adminStore';

const DataExportSection = ({ onExportSuccess }) => {
  const { exportEvents, exportVolunteers } = useAdminStore();
  const [isExportingEvents, setIsExportingEvents] = useState(false);
  const [isExportingVolunteers, setIsExportingVolunteers] = useState(false);
  const [error, setError] = useState('');

  const handleExportEvents = async (format) => {
    setIsExportingEvents(true);
    setError('');

    const result = await exportEvents(format);
    
    setIsExportingEvents(false);

    if (result.success) {
      onExportSuccess?.(`Đã xuất danh sách sự kiện (${format.toUpperCase()})`);
    } else {
      setError(result.error);
    }
  };

  const handleExportVolunteers = async (format) => {
    setIsExportingVolunteers(true);
    setError('');

    const result = await exportVolunteers(format);
    
    setIsExportingVolunteers(false);

    if (result.success) {
      onExportSuccess?.(`Đã xuất danh sách tình nguyện viên (${format.toUpperCase()})`);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-2 border-teal-100">
      <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-3 shadow-lg">
          <Download className="h-5 w-5 text-white" />
        </div>
        Xuất dữ liệu
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Export Events */}
        <div className="border-2 border-teal-100 rounded-2xl p-5 bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-3 shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">🎉 Danh sách sự kiện</h4>
                <p className="text-sm text-gray-600">Xuất tất cả sự kiện trong hệ thống</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleExportEvents('csv')}
              disabled={isExportingEvents}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 text-sm"
            >
              {isExportingEvents ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Xuất CSV
            </button>
            
            <button
              onClick={() => handleExportEvents('json')}
              disabled={isExportingEvents}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 text-sm"
            >
              {isExportingEvents ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Xuất JSON
            </button>
          </div>
        </div>

        {/* Export Volunteers */}
        <div className="border-2 border-purple-100 rounded-2xl p-5 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3 shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">👥 Danh sách tình nguyện viên</h4>
                <p className="text-sm text-gray-600">Xuất tất cả tình nguyện viên đã đăng ký</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleExportVolunteers('csv')}
              disabled={isExportingVolunteers}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 text-sm"
            >
              {isExportingVolunteers ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Xuất CSV
            </button>
            
            <button
              onClick={() => handleExportVolunteers('json')}
              disabled={isExportingVolunteers}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 text-sm"
            >
              {isExportingVolunteers ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Xuất JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportSection;
