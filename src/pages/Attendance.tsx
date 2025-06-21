import React, { useState } from 'react';
import { Plus, UserCheck, UserX, Clock, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Attendance as AttendanceType } from '../types';
import { exportAttendanceToPDF } from '../utils/pdfExport';
import Swal from 'sweetalert2';

interface AttendanceFormData {
  meeting: string;
  participantName: string;
  participantEmail: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

export const Attendance: React.FC = () => {
  const { meetings, attendances, addAttendance, updateAttendance, isLoading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceType | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendanceFormData>();

  const onSubmit = async (data: AttendanceFormData) => {
    try {
      const attendanceData = {
        meeting: data.meeting,
        participant: {
          name: data.participantName,
          email: data.participantEmail
        },
        status: data.status,
        notes: data.notes
      };

      if (editingAttendance) {
        await updateAttendance(editingAttendance._id || editingAttendance.id!, attendanceData);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Kehadiran berhasil diperbarui',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await addAttendance(attendanceData);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Kehadiran berhasil dicatat',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setIsModalOpen(false);
      setEditingAttendance(null);
      reset();
    } catch (error) {
      console.error('Error saving attendance:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal menyimpan kehadiran',
        icon: 'error'
      });
    }
  };

  const handleEdit = (attendance: AttendanceType) => {
    setEditingAttendance(attendance);
    reset({
      meeting: attendance.meeting,
      participantName: attendance.participant.name,
      participantEmail: attendance.participant.email,
      status: attendance.status,
      notes: attendance.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleExportPDF = async (meetingId: string) => {
    try {
      const meeting = meetings.find(m => (m._id || m.id) === meetingId);
      const meetingAttendances = attendances.filter(a => a.meeting === meetingId);
      
      if (meeting) {
        await exportAttendanceToPDF(meeting, meetingAttendances);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Daftar hadir berhasil diekspor ke PDF',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal mengekspor PDF',
        icon: 'error'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'absent': return <UserX className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'excused': return <UserCheck className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-orange-100 text-orange-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Hadir';
      case 'absent': return 'Tidak Hadir';
      case 'late': return 'Terlambat';
      case 'excused': return 'Izin';
      default: return status;
    }
  };

  const getMeetingTitle = (meetingId: string) => {
    const meeting = meetings.find(m => (m._id || m.id) === meetingId);
    return meeting?.title || 'Rapat Tidak Diketahui';
  };

  // Group attendances by meeting
  const attendancesByMeeting = attendances.reduce((acc, attendance) => {
    const meetingId = attendance.meeting;
    if (!acc[meetingId]) {
      acc[meetingId] = [];
    }
    acc[meetingId].push(attendance);
    return acc;
  }, {} as Record<string, AttendanceType[]>);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kehadiran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Hadir</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Catat Kehadiran
        </Button>
      </div>

      {/* Group by Meeting */}
      {Object.keys(attendancesByMeeting).map(meetingId => {
        const meetingAttendances = attendancesByMeeting[meetingId];
        const meeting = meetings.find(m => (m._id || m.id) === meetingId);
        
        return (
          <Card key={meetingId} className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getMeetingTitle(meetingId)}
                  </h3>
                  {meeting && (
                    <p className="text-sm text-gray-600">
                      {format(new Date(meeting.date), 'dd MMM yyyy', { locale: id })} • {meeting.startTime} - {meeting.endTime}
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExportPDF(meetingId)}
                >
                  <Download size={14} className="mr-1" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetingAttendances.map((attendance) => (
                  <div key={attendance._id || attendance.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{attendance.participant.name}</h4>
                        <p className="text-sm text-gray-600">{attendance.participant.email}</p>
                      </div>
                      <button
                        onClick={() => handleEdit(attendance)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                        {getStatusIcon(attendance.status)}
                        <span className="ml-1">{getStatusText(attendance.status)}</span>
                      </span>
                    </div>
                    
                    {attendance.checkInTime && (
                      <div className="text-xs text-gray-500">
                        Check-in: {format(new Date(attendance.checkInTime), 'HH:mm', { locale: id })}
                      </div>
                    )}
                    
                    {attendance.notes && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">{attendance.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {attendances.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada catatan kehadiran</h3>
          <p className="text-gray-600 mb-4">Mulai mencatat kehadiran untuk rapat Anda</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Catat Kehadiran
          </Button>
        </div>
      )}

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
              {...register('meeting', { required: 'Rapat wajib dipilih' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Pilih rapat</option>
              {meetings.map(meeting => (
                <option key={meeting._id || meeting.id} value={meeting._id || meeting.id}>
                  {meeting.title} - {format(new Date(meeting.date), 'dd MMM yyyy', { locale: id })}
                </option>
              ))}
            </select>
            {errors.meeting && (
              <p className="text-sm text-red-600">{errors.meeting.message}</p>
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
              <option value="excused">Izin</option>
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