import React, { createContext, useContext, useEffect, useState } from 'react';
import { Meeting, Attendance, MeetingMinutes, Notification } from '../types';
import { apiService } from '../services/api';

interface AppContextType {
  meetings: Meeting[];
  attendances: Attendance[];
  meetingMinutes: MeetingMinutes[];
  notifications: Notification[];
  isLoading: boolean;
  addMeeting: (meeting: any) => Promise<void>;
  updateMeeting: (id: string, meeting: any) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  addAttendance: (attendance: any) => Promise<void>;
  updateAttendance: (id: string, attendance: any) => Promise<void>;
  addMeetingMinutes: (minutes: any) => Promise<void>;
  updateMeetingMinutes: (id: string, minutes: any) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [meetingsRes, attendanceRes, minutesRes, notificationsRes] = await Promise.all([
        apiService.getMeetings(),
        apiService.getAttendance(),
        apiService.getMinutes(),
        apiService.getNotifications()
      ]);

      if (meetingsRes.success) {
        setMeetings(meetingsRes.data.meetings || []);
      }
      if (attendanceRes.success) {
        setAttendances(attendanceRes.data.attendance || []);
      }
      if (minutesRes.success) {
        setMeetingMinutes(minutesRes.data.minutes || []);
      }
      if (notificationsRes.success) {
        setNotifications(notificationsRes.data.notifications || []);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addMeeting = async (meetingData: any) => {
    try {
      const response = await apiService.createMeeting(meetingData);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding meeting:', error);
      throw error;
    }
  };

  const updateMeeting = async (id: string, meetingData: any) => {
    try {
      const response = await apiService.updateMeeting(id, meetingData);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      const response = await apiService.deleteMeeting(id);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  };

  const addAttendance = async (attendanceData: any) => {
    try {
      const response = await apiService.recordAttendance(attendanceData);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  };

  const updateAttendance = async (id: string, attendanceData: any) => {
    try {
      const response = await apiService.updateAttendance(id, attendanceData);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  };

  const addMeetingMinutes = async (minutesData: any) => {
    try {
      const response = await apiService.createMinutes(minutesData);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding meeting minutes:', error);
      throw error;
    }
  };

  const updateMeetingMinutes = async (id: string, minutesData: any) => {
    try {
      const response = await apiService.updateMinutes(id, minutesData);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating meeting minutes:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const response = await apiService.markNotificationAsRead(id);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await apiService.deleteNotification(id);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      meetings,
      attendances,
      meetingMinutes,
      notifications,
      isLoading,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      addAttendance,
      updateAttendance,
      addMeetingMinutes,
      updateMeetingMinutes,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};