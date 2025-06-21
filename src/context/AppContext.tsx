import React, { createContext, useContext, useEffect, useState } from 'react';
import { Meeting, Attendance, MeetingMinutes, Notification } from '../types';

interface AppContextType {
  meetings: Meeting[];
  attendances: Attendance[];
  meetingMinutes: MeetingMinutes[];
  notifications: Notification[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  addAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void;
  addMeetingMinutes: (minutes: Omit<MeetingMinutes, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMeetingMinutes: (id: string, minutes: Partial<MeetingMinutes>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutes[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Muat data dari localStorage
    const storedMeetings = localStorage.getItem('meetings');
    const storedAttendances = localStorage.getItem('attendances');
    const storedMinutes = localStorage.getItem('meetingMinutes');
    const storedNotifications = localStorage.getItem('notifications');

    if (storedMeetings) setMeetings(JSON.parse(storedMeetings));
    if (storedAttendances) setAttendances(JSON.parse(storedAttendances));
    if (storedMinutes) setMeetingMinutes(JSON.parse(storedMinutes));
    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
  }, []);

  const addMeeting = (meeting: Omit<Meeting, 'id' | 'createdAt'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    const updatedMeetings = [...meetings, newMeeting];
    setMeetings(updatedMeetings);
    localStorage.setItem('meetings', JSON.stringify(updatedMeetings));

    // Tambah notifikasi untuk rapat baru
    addNotification({
      type: 'meeting-reminder',
      title: 'Rapat Baru Dijadwalkan',
      message: `Rapat "${meeting.title}" telah dijadwalkan pada ${new Date(meeting.date).toLocaleDateString('id-ID')}`,
      isRead: false,
      relatedMeetingId: newMeeting.id
    });
  };

  const updateMeeting = (id: string, meeting: Partial<Meeting>) => {
    const updatedMeetings = meetings.map(m => m.id === id ? { ...m, ...meeting } : m);
    setMeetings(updatedMeetings);
    localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
  };

  const deleteMeeting = (id: string) => {
    const updatedMeetings = meetings.filter(m => m.id !== id);
    setMeetings(updatedMeetings);
    localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
  };

  const addAttendance = (attendance: Omit<Attendance, 'id'>) => {
    const newAttendance: Attendance = {
      ...attendance,
      id: Date.now().toString()
    };
    const updatedAttendances = [...attendances, newAttendance];
    setAttendances(updatedAttendances);
    localStorage.setItem('attendances', JSON.stringify(updatedAttendances));
  };

  const updateAttendance = (id: string, attendance: Partial<Attendance>) => {
    const updatedAttendances = attendances.map(a => a.id === id ? { ...a, ...attendance } : a);
    setAttendances(updatedAttendances);
    localStorage.setItem('attendances', JSON.stringify(updatedAttendances));
  };

  const addMeetingMinutes = (minutes: Omit<MeetingMinutes, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMinutes: MeetingMinutes = {
      ...minutes,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedMinutes = [...meetingMinutes, newMinutes];
    setMeetingMinutes(updatedMinutes);
    localStorage.setItem('meetingMinutes', JSON.stringify(updatedMinutes));
  };

  const updateMeetingMinutes = (id: string, minutes: Partial<MeetingMinutes>) => {
    const updatedMinutes = meetingMinutes.map(m => 
      m.id === id ? { ...m, ...minutes, updatedAt: new Date() } : m
    );
    setMeetingMinutes(updatedMinutes);
    localStorage.setItem('meetingMinutes', JSON.stringify(updatedMinutes));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const markNotificationAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  return (
    <AppContext.Provider value={{
      meetings,
      attendances,
      meetingMinutes,
      notifications,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      addAttendance,
      updateAttendance,
      addMeetingMinutes,
      updateMeetingMinutes,
      addNotification,
      markNotificationAsRead,
      clearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};