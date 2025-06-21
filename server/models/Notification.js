import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['meeting-reminder', 'meeting-update', 'meeting-cancelled', 'action-item', 'minutes-available', 'general'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [300, 'Message cannot exceed 300 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedMeeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  relatedActionItem: {
    type: mongoose.Schema.Types.ObjectId
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ scheduledFor: 1 });

export default mongoose.model('Notification', notificationSchema);