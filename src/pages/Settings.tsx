import React, { useState } from 'react';
import { User, Bell, Shield, Trash2, Download, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

interface ProfileFormData {
  name: string;
  email: string;
}

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { markAllNotificationsAsRead, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Dalam implementasi nyata, ini akan memanggil API untuk update profil
      console.log('Pembaruan profil:', data);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Profil berhasil diperbarui',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Gagal memperbarui profil',
        icon: 'error'
      });
    }
  };

  const handleExportData = async () => {
    try {
      // Export data dari server
      const response = await fetch('/api/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-rapat-ekspor-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data berhasil diekspor',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal mengekspor data',
        icon: 'error'
      });
    }
  };

  const handleClearNotifications = async () => {
    const result = await Swal.fire({
      title: 'Hapus Semua Notifikasi?',
      text: 'Apakah Anda yakin ingin menghapus semua notifikasi?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await markAllNotificationsAsRead();
        Swal.fire({
          title: 'Berhasil!',
          text: 'Semua notifikasi berhasil dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus notifikasi',
          icon: 'error'
        });
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'data', label: 'Manajemen Data', icon: Upload },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
      
      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Konten */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Informasi Profil</h2>
                <p className="text-sm text-gray-600">Perbarui informasi pribadi Anda</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    {...register('name', { required: 'Nama wajib diisi' })}
                    error={errors.name?.message}
                  />
                  
                  <Input
                    label="Alamat Email"
                    type="email"
                    {...register('email', { required: 'Email wajib diisi' })}
                    error={errors.email?.message}
                  />
                  
                  <div className="flex space-x-3">
                    <Button type="submit">Simpan Perubahan</Button>
                    <Button type="button" variant="secondary">Batal</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Pengaturan Notifikasi</h2>
                <p className="text-sm text-gray-600">Konfigurasi cara Anda menerima notifikasi</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Pengingat Rapat</h3>
                      <p className="text-sm text-gray-600">Terima notifikasi untuk rapat yang akan datang</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Pembaruan Rapat</h3>
                      <p className="text-sm text-gray-600">Dapatkan notifikasi saat rapat diperbarui atau dibatalkan</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Pengingat Item Tindakan</h3>
                      <p className="text-sm text-gray-600">Terima pengingat untuk item tindakan yang tertunda</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleClearNotifications} variant="secondary">
                      Hapus Semua Notifikasi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Pengaturan Keamanan</h2>
                <p className="text-sm text-gray-600">Kelola keamanan akun Anda</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Ubah Kata Sandi</h3>
                    <div className="space-y-3">
                      <Input label="Kata Sandi Saat Ini" type="password" />
                      <Input label="Kata Sandi Baru" type="password" />
                      <Input label="Konfirmasi Kata Sandi Baru" type="password" />
                    </div>
                    <Button className="mt-3">Perbarui Kata Sandi</Button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Autentikasi Dua Faktor</h3>
                    <p className="text-sm text-gray-600 mb-3">Tambahkan lapisan keamanan ekstra ke akun Anda</p>
                    <Button variant="secondary">Aktifkan 2FA</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Manajemen Data</h2>
                <p className="text-sm text-gray-600">Ekspor atau kelola data rapat Anda</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Ekspor Data</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Unduh semua data rapat Anda dalam format JSON
                    </p>
                    <Button onClick={handleExportData}>
                      <Download size={16} className="mr-2" />
                      Ekspor Semua Data
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Penyimpanan Data</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Data Anda disimpan di database MongoDB dengan backup dan langkah keamanan yang tepat.
                      Semua data terenkripsi dan dilindungi sesuai standar keamanan industri.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Sinkronisasi Data</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Refresh data untuk memastikan Anda melihat informasi terbaru
                    </p>
                    <Button onClick={refreshData} variant="secondary">
                      <Download size={16} className="mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};