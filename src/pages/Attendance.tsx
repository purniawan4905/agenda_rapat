import React, { useState } from 'react';
import { Plus, UserCheck, UserX, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Attendance as AttendanceType } from '../types';

interface AttendanceFormData {
  meetingId: string;
  participantName: string;
  participantEmail: string;
  status: 'present' | 'absent' | 'late';
  notes: string;
}

export const Attendance: React.FC = () => {
  const { meetings, attendances, addAttendance, updateAttendance } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceType | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendanceFormData>();

  const onSubmit = (data: AttendanceFormData) => {
    const attendanceData = {
      ...data,
      checkInTime: data.status === 'present' ? new Date() : undefined
    };

    if (editingAttendance) {
      updateAttendance(editingAttendance.id, attendanceData);
    } else {
      addAttendance(attendanceData);
    }

    setIsModalOpen(false);
    setEditingAttendance(null);
    reset();
  };

  const handleEdit = (attendance: AttendanceType) => {
    setEditingAttendance(attendance);
    reset({
      meetingId: attendance.meetingId,
      participantName: attendance.participantName,
      participantEmail: attendance.participantEmail,
      status: attendance.status,
      notes: attendance.notes || ''
    });
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'absent': return <UserX className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Hadir';
      case 'absent': return 'Tidak Hadir';
      case 'late': return 'Terlambat';
      default: return status;
    }
  };

  const getMeetingTitle = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    return meeting?.title || 'Rapat Tidak Diketahui';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Hadir</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Catat Kehadiran
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendances.map((attendance) => (
          <Card key={attendance.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{attendance.participantName}</h3>
                  <p className="text-sm text-gray-600">{attendance.participantEmail}</p>
                </div>
                <button
                  onClick={() => handleEdit(attendance)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Rapat</p>
                  <p className="text-sm text-gray-600">{getMeetingTitle(attendance.meetingId)}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                    {getStatusIcon(attendance.status)}
                    <span className="ml-1">{getStatusText(attendance.status)}</span>
                  </span>
                </div>
                
                {attendance.checkInTime && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Waktu Check-in</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(attendance.checkInTime), 'dd MMM yyyy HH:mm', { locale: id })}
                    </p>
                  </div>
                )}
                
                {attendance.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Catatan</p>
                    <p className="text-sm text-gray-600">{attendance.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {attendances.length === 0 && (
          <div className="col-span-full text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada catatan kehadiran</h3>
            <p className="text-gray-600 mb-4">Mulai mencatat kehadiran untuk rapat Anda</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Catat Kehadiran
            </Button>
          </div>
        )}
      </div>

      {/* Modal Form Kehadiran */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAttendance(null);
          reset();
        }}
        title={editingAttendance ? 'Edit Kehadiran' : 'Catat Kehadiran'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Rapat</label>
            <select
              {...register('meetingId', { required: 'Rapat wajib dipilih' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Pilih rapat</option>
              {meetings.map(meeting => (
                <option key={meeting.id} value={meeting.id}>
                  {meeting.title} - {format(new Date(meeting.date), 'dd MMM yyyy', { locale: id })}
                </option>
              ))}
            </select>
            {errors.meetingId && (
              <p className="text-sm text-red-600">{errors.meetingId.message}</p>
            )}
          </div>
          
          <Input
            label="Nama Peserta"
            {...register('participantName', { required: 'Nama wajib diisi' })}
            error={errors.participantName?.message}
          />
          
          <Input
            label="Email Peserta"
            type="email"
            {...register('participantEmail', { required: 'Email wajib diisi' })}
            error={errors.participantEmail?.message}
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status', { required: 'Status wajib dipilih' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Pilih status</option>
              <option value="present">Hadir</option>
              <option value="absent">Tidak Hadir</option>
              <option value="late">Terlambat</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
            <textarea
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Catatan tambahan tentang kehadiran..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingAttendance ? 'Perbarui Kehadiran' : 'Catat Kehadiran'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAttendance(null);
                reset();
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};