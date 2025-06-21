import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  participant: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: [true, 'Participant name is required']
    },
    email: {
      type: String,
      required: [true, 'Participant email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique attendance record per participant per meeting
attendanceSchema.index({ meeting: 1, 'participant.email': 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);