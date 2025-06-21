import mongoose from 'mongoose';

const actionItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Action item description is required'],
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  assignedTo: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

const meetingMinutesSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Meeting content is required']
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  actionItems: [actionItemSchema],
  decisions: [{
    description: {
      type: String,
      required: true,
      maxlength: [300, 'Decision description cannot exceed 300 characters']
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  keyPoints: [{
    type: String,
    maxlength: [200, 'Key point cannot exceed 200 characters']
  }],
  nextMeetingDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('MeetingMinutes', meetingMinutesSchema);