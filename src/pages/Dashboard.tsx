import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, Users, FileText, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { meetings, attendances, meetingMinutes, notifications } = useApp();

  // Statistik
  const totalMeetings = meetings.length;
  const totalAttendances = attendances.length;
  const totalMinutes = meetingMinutes.length;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Data status rapat untuk pie chart
  const meetingStatusData = [
    { name: 'Terjadwal', value: meetings.filter(m => m.status === 'scheduled').length, color: '#3B82F6' },
    { name: 'Berlangsung', value: meetings.filter(m => m.status === 'ongoing').length, color: '#10B981' },
    { name: 'Selesai', value: meetings.filter(m => m.status === 'completed').length, color: '#6B7280' },
    { name: 'Dibatalkan', value: meetings.filter(m => m.status === 'cancelled').length, color: '#EF4444' },
  ];

  // Data rapat bulanan untuk bar chart
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthlyMeetingData = daysInMonth.slice(0, 7).map(day => ({
    day: format(day, 'dd MMM', { locale: id }),
    meetings: meetings.filter(m => isSameDay(new Date(m.date), day)).length,
  }));

  const stats = [
    {
      title: 'Total Rapat',
      value: totalMeetings,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12% dari bulan lalu'
    },
    {
      title: 'Kehadiran',
      value: totalAttendances,
      icon: Users,
      color: 'bg-green-500',
      change: '+8% dari bulan lalu'
    },
    {
      title: 'Notulensi',
      value: totalMinutes,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+15% dari bulan lalu'
    },
    {
      title: 'Notifikasi',
      value: unreadNotifications,
      icon: Clock,
      color: 'bg-orange-500',
      change: 'Tindakan tertunda'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp size={16} />
          <span>Ringkasan Analitik</span>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Rapat Mingguan */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Rapat Mingguan</h3>
            <p className="text-sm text-gray-600">Rapat yang dijadwalkan minggu ini</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyMeetingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="meetings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribusi Status Rapat */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Status Rapat</h3>
            <p className="text-sm text-gray-600">Distribusi status rapat</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={meetingStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {meetingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifikasi Terbaru */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Notifikasi Terbaru</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className={`p-2 rounded-full ${notification.isRead ? 'bg-gray-200' : 'bg-blue-100'}`}>
                  <Clock className={`w-4 h-4 ${notification.isRead ? 'text-gray-500' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-gray-500 text-center py-4">Belum ada notifikasi</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};