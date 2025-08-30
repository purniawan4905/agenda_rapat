import React, { useState } from 'react';
import { Plus, FileText, Edit, Calendar, User, Download, Eye, CheckCircle, Clock } from 'lucide-react';
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
import { exportMeetingToPDF } from '../utils/pdfExport';
import Swal from 'sweetalert2';

interface MinutesFormData {
  meeting: string;
  content: string;
  summary: string;
  actionItems: string;
  decisions: string;
  keyPoints: string;
  nextMeetingDate: string;
}

export const Minutes: React.FC = () => {
  const { meetings, meetingMinutes, attendances, addMeetingMinutes, updateMeetingMinutes, isLoading } = useApp();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingMinutes, setEditingMinutes] = useState<MeetingMinutes | null>(null);
  const [viewingMinutes, setViewingMinutes] = useState<MeetingMinutes | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MinutesFormData>();

  const onSubmit = async (data: MinutesFormData) => {
    try {
      const minutesData = {
        meeting: data.meeting,
        content: data.content,
        summary: data.summary,
        actionItems: data.actionItems.split('\n').filter(item => item.trim()).map((item, index) => ({
          description: item.trim(),
          assignedTo: {
            name: 'Belum Ditugaskan',
            email: ''
          },
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'pending' as const,
          priority: 'medium' as const
        })),
        decisions: data.decisions.split('\n').filter(item => item.trim()).map(item => ({
          description: item.trim(),
          impact: 'medium' as const
        })),
        keyPoints: data.keyPoints.split('\n').filter(item => item.trim()),
        nextMeetingDate: data.nextMeetingDate ? new Date(data.nextMeetingDate) : undefined,
        isApproved: false
      };

      if (editingMinutes) {
        await updateMeetingMinutes(editingMinutes._id || editingMinutes.id!, minutesData);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Notulensi berhasil diperbarui',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await addMeetingMinutes(minutesData);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Notulensi berhasil dibuat',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setIsModalOpen(false);
      setEditingMinutes(null);
      reset();
    } catch (error) {
      console.error('Error saving minutes:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal menyimpan notulensi',
        icon: 'error'
      });
    }
  };

  const handleEdit = (minutes: MeetingMinutes) => {
    setEditingMinutes(minutes);
    reset({
      meeting: minutes.meeting,
      content: minutes.content,
      summary: minutes.summary || '',
      actionItems: minutes.actionItems.map(item => item.description).join('\n'),
      decisions: minutes.decisions.map(d => typeof d === 'string' ? d : d.description).join('\n'),
      keyPoints: minutes.keyPoints?.join('\n') || '',
      nextMeetingDate: minutes.nextMeetingDate ? format(new Date(minutes.nextMeetingDate), 'yyyy-MM-dd') : ''
    });
    setIsModalOpen(true);
  };

  const handleView = (minutes: MeetingMinutes) => {
    setViewingMinutes(minutes);
    setIsViewModalOpen(true);
  };

  const handleExportPDF = async (minutes: MeetingMinutes) => {
    try {
      const meeting = meetings.find(m => (m._id || m.id) === minutes.meeting);
      const meetingAttendances = attendances.filter(a => a.meeting === minutes.meeting);
      
      if (meeting) {
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
          title: 'Error!',
          text: 'Data rapat tidak ditemukan',
          icon: 'error'
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

  const getMeetingTitle = (meetingId: string) => {
    const meeting = meetings.find(m => (m._id || m.id) === meetingId);
    return meeting?.title || 'Rapat Tidak Diketahui';
  };

  const getMeetingDate = (meetingId: string) => {
    const meeting = meetings.find(m => (m._id || m.id) === meetingId);
    return meeting ? format(new Date(meeting.date), 'dd MMM yyyy', { locale: id }) : 'Tanggal Tidak Diketahui';
  };

  const getCreatorName = (createdBy: any) => {
    if (typeof createdBy === 'object' && createdBy?.name) {
      return createdBy.name;
    }
    return 'Tidak diketahui';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data notulensi...</p>
        </div>
      </div>
    );
  }

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
          <Card key={minutes._id || minutes.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{getMeetingTitle(minutes.meeting)}</h3>
                  <p className="text-sm text-gray-600">{getMeetingDate(minutes.meeting)}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {minutes.isApproved ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Disetujui
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={12} className="mr-1" />
                        Menunggu Persetujuan
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleView(minutes)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleExportPDF(minutes)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Export PDF"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleEdit(minutes)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {minutes.summary && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ringkasan</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {minutes.summary.length > 150 
                        ? `${minutes.summary.substring(0, 150)}...` 
                        : minutes.summary
                      }
                    </p>
                  </div>
                )}
                
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
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Item Tindakan ({minutes.actionItems.length})</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {minutes.actionItems.slice(0, 3).map((item, index) => (
                        <li key={item._id || index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span className="truncate">{item.description}</span>
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
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Keputusan ({minutes.decisions.length})</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {minutes.decisions.slice(0, 2).map((decision, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span className="truncate">
                            {typeof decision === 'string' ? decision : decision.description}
                          </span>
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
                      {getCreatorName(minutes.createdBy)}
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
        <div className="max-h-96 overflow-y-auto">
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Ringkasan Rapat</label>
              <textarea
                {...register('summary')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Ringkasan singkat tentang rapat..."
              />
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Poin Kunci (satu per baris)</label>
              <textarea
                {...register('keyPoints')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Poin-poin penting yang perlu diingat..."
              />
            </div>

            <Input
              label="Tanggal Rapat Berikutnya (Opsional)"
              type="date"
              {...register('nextMeetingDate')}
            />
            
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
        </div>
      </Modal>

      {/* Modal View Detail Notulensi */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingMinutes(null);
        }}
        title="Detail Notulensi Rapat"
      >
        {viewingMinutes && (
          <div className="max-h-96 overflow-y-auto space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Rapat: {getMeetingTitle(viewingMinutes.meeting)}</h4>
              <p className="text-sm text-gray-600">Tanggal: {getMeetingDate(viewingMinutes.meeting)}</p>
            </div>

            {viewingMinutes.summary && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Ringkasan</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{viewingMinutes.summary}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Catatan Rapat</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{viewingMinutes.content}</p>
            </div>

            {viewingMinutes.keyPoints && viewingMinutes.keyPoints.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Poin Kunci</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {viewingMinutes.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewingMinutes.decisions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Keputusan yang Diambil</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {viewingMinutes.decisions.map((decision, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {typeof decision === 'string' ? decision : decision.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewingMinutes.actionItems.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Item Tindakan</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  {viewingMinutes.actionItems.map((item, index) => (
                    <li key={item._id || index} className="border-l-2 border-blue-500 pl-3">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-xs text-gray-500">
                        PIC: {typeof item.assignedTo === 'object' ? item.assignedTo.name : item.assignedTo} | 
                        Deadline: {format(new Date(item.dueDate), 'dd MMM yyyy', { locale: id })} |
                        Status: {item.status}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewingMinutes.nextMeetingDate && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Rapat Berikutnya</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(viewingMinutes.nextMeetingDate), 'dd MMMM yyyy', { locale: id })}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Dibuat oleh: {getCreatorName(viewingMinutes.createdBy)}</span>
                <span>Tanggal: {format(new Date(viewingMinutes.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};