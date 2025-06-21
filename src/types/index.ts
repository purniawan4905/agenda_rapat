export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Meeting {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  organizer: any;
  attendees: Array<{
    user?: string;
    email: string;
    name: string;
    status: 'invited' | 'accepted' | 'declined' | 'tentative';
  }>;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingType?: 'in-person' | 'virtual' | 'hybrid';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: Date;
}

export interface Attendance {
  _id?: string;
  id?: string;
  meeting: string;
  participant: {
    user?: string;
    name: string;
    email: string;
  };
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  recordedBy: string;
  createdAt?: Date;
}

export interface MeetingMinutes {
  _id?: string;
  id?: string;
  meeting: string;
  content: string;
  summary?: string;
  actionItems: ActionItem[];
  decisions: Array<{
    description: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  keyPoints?: string[];
  nextMeetingDate?: Date;
  createdBy: string;
  lastModifiedBy?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionItem {
  _id?: string;
  id?: string;
  description: string;
  assignedTo: {
    user?: string;
    name: string;
    email: string;
  };
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  _id?: string;
  id?: string;
  recipient: string;
  type: 'meeting-reminder' | 'meeting-update' | 'meeting-cancelled' | 'action-item' | 'minutes-available' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedMeeting?: string;
  relatedActionItem?: string;
  scheduledFor?: Date;
  sentAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}