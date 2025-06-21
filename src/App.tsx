import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Meetings } from './pages/Meetings';
import { Attendance } from './pages/Attendance';
import { Minutes } from './pages/Minutes';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="minutes" element={<Minutes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AppProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;