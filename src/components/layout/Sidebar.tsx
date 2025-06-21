import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Bell 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Swal from 'sweetalert2';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications } = useApp();
  const location = useLocation();
  
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    Swal.fire({
    title: 'Keluar dari sistem?',
    text: 'Anda yakin ingin keluar?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, keluar',
    cancelButtonText: 'Batal',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      logout();
      Swal.fire({
        title: 'Berhasil keluar',
        text: 'Sampai jumpa kembali!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    }
  });
};

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/meetings', icon: Calendar, label: 'Agenda Rapat' },
    { path: '/attendance', icon: Users, label: 'Daftar Hadir' },
    { path: '/minutes', icon: FileText, label: 'Notulensi' },
    { path: '/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Rapat Hub</h2>
            <p className="text-sm text-gray-600">Selamat datang, {user?.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6">
        <div className="space-y-2 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.path === '/dashboard' && unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadNotifications}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};