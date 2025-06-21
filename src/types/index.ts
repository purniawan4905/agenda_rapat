export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  attendees: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Attendance {
  id: string;
  meetingId: string;
  participantName: string;
  participantEmail: string;
  status: 'present' | 'absent' | 'late';
  checkInTime?: Date;
  notes?: string;
}

export interface MeetingMinutes {
  id: string;
  meetingId: string;
  content: string;
  actionItems: ActionItem[];
  decisions: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Notification {
  id: string;
  type: 'meeting-reminder' | 'meeting-update' | 'action-item' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedMeetingId?: string;
}