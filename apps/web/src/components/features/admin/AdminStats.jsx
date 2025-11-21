import React from 'react';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

const AdminStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Sự kiện chờ duyệt',
      value: stats?.pendingEvents || 0,
      icon: Clock,
      color: 'text-yellow-700',
      bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Tổng sự kiện',
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: 'text-teal-700',
      bgColor: 'bg-gradient-to-br from-teal-100 to-cyan-100',
      borderColor: 'border-teal-200'
    },
    {
      title: 'Sự kiện đã duyệt',
      value: stats?.approvedEvents || 0,
      icon: CheckCircle,
      color: 'text-green-700',
      bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Tổng tình nguyện viên',
      value: stats?.totalVolunteers || 0,
      icon: Users,
      color: 'text-purple-700',
      bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 ${stat.borderColor} p-6 hover:shadow-2xl transition-all transform hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                {stat.title}
              </p>
              <p className="text-3xl font-black text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-4 rounded-2xl shadow-md border ${stat.borderColor}`}>
              <stat.icon className="h-7 w-7" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
