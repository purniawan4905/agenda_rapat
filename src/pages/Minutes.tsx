import React, { useState } from 'react';
import { Plus, FileText, Edit, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MeetingMinutes } from '../types';

interface MinutesFormData {
  meetingId: string;
  content: string;
  actionItems: string;
  decisions: string;
}

export const Minutes: React.FC = () => {
  const { meetings, meetingMinutes, addMeetingMinutes, updateMeetingMinutes } = useApp();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMinutes, setEditingMinutes] = useState<MeetingMinutes | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MinutesFormData>();

  const onSubmit = (data: MinutesFormData) => {
    const minutesData = {
      ...data,
      actionItems: data.actionItems.split('\n').filter(item => item.trim()).map((item, index) => ({
        id: Date.now().toString() + index,
        description: item.trim(),
        assignedTo: 'Belum Ditugaskan',
        dueDate: new Date(),
        status: 'pending' as const
      })),
      decisions: data.decisions.split('\n').filter(item => item.trim()),
      createdBy: user?.email || ''
    };

    if (editingMinutes) {
      updateMeetingMinutes(editingMinutes.id, minutesData);
    } else {
      addMeetingMinutes(minutesData);
    }

    setIsModalOpen(false);
    setEditingMinutes(null);
    reset();
  };

  const handleEdit = (minutes: MeetingMinutes) => {
    setEditingMinutes(minutes);
    reset({
      meetingId: minutes.meetingId,
      content: minutes.content,
      actionItems: minutes.actionItems.map(item => item.description).join('\n'),
      decisions: minutes.decisions.join('\n')
    });
    setIsModalOpen(true);
  };

  const getMeetingTitle = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    return meeting?.title || 'Rapat Tidak Diketahui';
  };

  const getMeetingDate = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    return meeting ? format(new Date(meeting.date), 'dd MMM yyyy', { locale: id }) : 'Tanggal Tidak Diketahui';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notulensi Rapat</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Notulensi Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meetingMinutes.map((minutes) => (
          <Card key={minutes.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{getMeetingTitle(minutes.meetingId)}</h3>
                  <p className="text-sm text-gray-600">{getMeetingDate(minutes.meetingId)}</p>
                </div>
                <button
                  onClick={() => handleEdit(minutes)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit size={14} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Catatan Rapat</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {minutes.content.length > 200 
                      ? `${minutes.content.substring(0, 200)}...` 
                      : minutes.content
                    }
                  </p>
                </div>
                
                {minutes.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Item Tindakan</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {minutes.actionItems.slice(0, 3).map((item) => (
                        <li key={item.id} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {item.description}
                        </li>
                      ))}
                      {minutes.actionItems.length > 3 && (
                        <li className="text-gray-500 italic">
                          +{minutes.actionItems.length - 3} item lainnya
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {minutes.decisions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Keputusan yang Diambil</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {minutes.decisions.slice(0, 2).map((decision, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {decision}
                        </li>
                      ))}
                      {minutes.decisions.length > 2 && (
                        <li className="text-gray-500 italic">
                          +{minutes.decisions.length - 2} keputusan lainnya
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <User size={12} className="mr-1" />
                      {minutes.createdBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {format(new Date(minutes.createdAt), 'dd MMM yyyy', { locale: id })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {meetingMinutes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada notulensi rapat</h3>
            <p className="text-gray-600 mb-4">Mulai mendokumentasikan diskusi dan keputusan rapat Anda</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Buat Notulensi
            </Button>
          </div>
        )}
      </div>

      {/* Modal Form Notulensi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMinutes(null);
          reset();
        }}
        title={editingMinutes ? 'Edit Notulensi Rapat' : 'Buat Notulensi Rapat'}
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
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Catatan Rapat</label>
            <textarea
              {...register('content', { required: 'Catatan rapat wajib diisi' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              placeholder="Catatan detail tentang diskusi rapat, poin-poin penting, dan hasil..."
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Item Tindakan (satu per baris)</label>
            <textarea
              {...register('actionItems')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Tindak lanjut dengan klien tentang timeline proyek&#10;Siapkan presentasi untuk rapat berikutnya&#10;Jadwalkan rapat tindak lanjut"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Keputusan yang Diambil (satu per baris)</label>
            <textarea
              {...register('decisions')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Menyetujui peningkatan anggaran sebesar 10%&#10;Memindahkan deadline ke bulan depan&#10;Menugaskan manajer proyek baru"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingMinutes ? 'Perbarui Notulensi' : 'Simpan Notulensi'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingMinutes(null);
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