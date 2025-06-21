import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Meeting description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  location: {
    type: String,
    required: [true, 'Meeting location is required'],
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'tentative'],
      default: 'invited'
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meetingType: {
    type: String,
    enum: ['in-person', 'virtual', 'hybrid'],
    default: 'in-person'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
meetingSchema.index({ date: 1, organizer: 1 });
meetingSchema.index({ 'attendees.email': 1 });

export default mongoose.model('Meeting', meetingSchema);