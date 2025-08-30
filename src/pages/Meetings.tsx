import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Users, Download, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Meeting } from '../types';
import { exportMeetingToPDF } from '../utils/pdfExport';
import Swal from 'sweetalert2';

interface MeetingFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string;
  meetingType: 'in-person' | 'virtual' | 'hybrid';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const Meetings: React.FC = () => {
  const { meetings, addMeeting, updateMeeting, deleteMeeting, meetingMinutes, attendances, isLoading } = useApp();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MeetingFormData>();

  const onSubmit = async (data: MeetingFormData) => {
    try {
      const attendeesList = data.attendees.split(',').map(email => ({
        email: email.trim(),
        name: email.trim().split('@')[0],
        status: 'invited' as const
      }));

      const meetingData = {
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        attendees: attendeesList,
        meetingType: data.meetingType,
        priority: data.priority
      };

      if (editingMeeting) {
        await updateMeeting(editingMeeting._id || editingMeeting.id!, meetingData);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Rapat berhasil diperbarui',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await addMeeting(meetingData);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Rapat berhasil dibuat',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setIsModalOpen(false);
      setEditingMeeting(null);
      reset();
    } catch (error) {
      console.error('Error saving meeting:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal menyimpan rapat',
        icon: 'error'
      });
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    reset({
      title: meeting.title,
      description: meeting.description,
      date: format(new Date(meeting.date), 'yyyy-MM-dd'),
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      location: meeting.location,
      attendees: meeting.attendees.map(a => a.email).join(', '),
      meetingType: meeting.meetingType || 'in-person',
      priority: meeting.priority || 'medium'
    });
    setIsModalOpen(true);
  };

  const handleView = (meeting: Meeting) => {
    setViewingMeeting(meeting);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (meeting: Meeting) => {
    const result = await Swal.fire({
      title: 'Hapus Rapat?',
      text: 'Apakah Anda yakin ingin menghapus rapat ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteMeeting(meeting._id || meeting.id!);
        Swal.fire({
          title: 'Terhapus!',
          text: 'Rapat berhasil dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting meeting:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus rapat',
          icon: 'error'
        });
      }
    }
  };

  const handleExportPDF = async (meeting: Meeting) => {
    try {
      const meetingId = meeting._id || meeting.id;
      const minutes = meetingMinutes.find(m => m.meeting === meetingId);
      const meetingAttendances = attendances.filter(a => a.meeting === meetingId);
      
      if (minutes) {
        await exportMeetingToPDF(meeting, minutes, meetingAttendances);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Notulensi berhasil diekspor ke PDF',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Peringatan!',
          text: 'Notulensi belum tersedia untuk rapat ini',
          icon: 'warning'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Terjadwal';
      case 'ongoing': return 'Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Rendah';
      case 'medium': return 'Sedang';
      case 'high': return 'Tinggi';
      case 'urgent': return 'Mendesak';
      default: return priority;
    }
  };

  const getMeetingTypeText = (type: string) => {
    switch (type) {
      case 'in-person': return 'Tatap Muka';
      case 'virtual': return 'Virtual';
      case 'hybrid': return 'Hybrid';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data rapat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agenda Rapat</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Rapat Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting._id || meeting.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{meeting.title}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {getStatusText(meeting.status)}
                    </span>
                    {meeting.priority && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(meeting.priority)}`}>
                        {getPriorityText(meeting.priority)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleView(meeting)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleExportPDF(meeting)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Export PDF"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleEdit(meeting)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(meeting)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-2" />
                  {format(new Date(meeting.date), 'dd MMM yyyy', { locale: id })}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={14} className="mr-2" />
                  {meeting.startTime} - {meeting.endTime}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-2" />
                  {meeting.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={14} className="mr-2" />
                  {meeting.attendees.length} peserta
                </div>
                {meeting.meetingType && (
                  <div className="text-xs text-gray-500">
                    Tipe: {getMeetingTypeText(meeting.meetingType)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {meetings.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada rapat</h3>
            <p className="text-gray-600 mb-4">Mulai dengan membuat rapat pertama Anda</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Buat Rapat
            </Button>
          </div>
        )}
      </div>

      {/* Modal Form Rapat */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMeeting(null);
          reset();
        }}
        title={editingMeeting ? 'Edit Rapat' : 'Buat Rapat Baru'}
      >
        <div className="max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Judul Rapat"
              {...register('title', { required: 'Judul wajib diisi' })}
              error={errors.title?.message}
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                {...register('description', { required: 'Deskripsi wajib diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            <Input
              label="Tanggal"
              type="date"
              {...register('date', { required: 'Tanggal wajib diisi' })}
              error={errors.date?.message}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Waktu Mulai"
                type="time"
                {...register('startTime', { required: 'Waktu mulai wajib diisi' })}
                error={errors.startTime?.message}
              />
              <Input
                label="Waktu Selesai"
                type="time"
                {...register('endTime', { required: 'Waktu selesai wajib diisi' })}
                error={errors.endTime?.message}
              />
            </div>
            
            <Input
              label="Lokasi"
              {...register('location', { required: 'Lokasi wajib diisi' })}
              error={errors.location?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Tipe Rapat</label>
                <select
                  {...register('meetingType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="in-person">Tatap Muka</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Prioritas</label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                  <option value="urgent">Mendesak</option>
                </select>
              </div>
            </div>
            
            <Input
              label="Peserta (email dipisah koma)"
              placeholder="john@example.com, jane@example.com"
              {...register('attendees', { required: 'Minimal satu peserta diperlukan' })}
              error={errors.attendees?.message}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingMeeting ? 'Perbarui Rapat' : 'Buat Rapat'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingMeeting(null);
                  reset();
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal View Detail Rapat */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingMeeting(null);
        }}
        title="Detail Rapat"
      >
        {viewingMeeting && (
          <div className="max-h-96 overflow-y-auto space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{viewingMeeting.title}</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingMeeting.status)}`}>
                  {getStatusText(viewingMeeting.status)}
                </span>
                {viewingMeeting.priority && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(viewingMeeting.priority)}`}>
                    {getPriorityText(viewingMeeting.priority)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Deskripsi</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{viewingMeeting.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Tanggal & Waktu</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(viewingMeeting.date), 'dd MMMM yyyy', { locale: id })}
                </p>
                <p className="text-sm text-gray-600">
                  {viewingMeeting.startTime} - {viewingMeeting.endTime}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Lokasi</h4>
                <p className="text-sm text-gray-600">{viewingMeeting.location}</p>
                {viewingMeeting.meetingType && (
                  <p className="text-xs text-gray-500 mt-1">
                    Tipe: {getMeetingTypeText(viewingMeeting.meetingType)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Peserta ({viewingMeeting.attendees.length})</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {viewingMeeting.attendees.map((attendee, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{attendee.name} ({attendee.email})</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      attendee.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      attendee.status === 'declined' ? 'bg-red-100 text-red-800' :
                      attendee.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {attendee.status === 'accepted' ? 'Diterima' :
                       attendee.status === 'declined' ? 'Ditolak' :
                       attendee.status === 'tentative' ? 'Ragu-ragu' : 'Diundang'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Dibuat pada: {format(new Date(viewingMeeting.createdAt || new Date()), 'dd MMM yyyy HH:mm', { locale: id })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};