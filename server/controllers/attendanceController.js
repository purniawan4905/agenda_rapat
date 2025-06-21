import Attendance from '../models/Attendance.js';
import Meeting from '../models/Meeting.js';

export const recordAttendance = async (req, res) => {
  try {
    const attendanceData = {
      ...req.body,
      recordedBy: req.user.id
    };

    // Check if meeting exists
    const meeting = await Meeting.findById(attendanceData.meeting);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Set check-in time if present
    if (attendanceData.status === 'present') {
      attendanceData.checkInTime = new Date();
    }

    const attendance = await Attendance.create(attendanceData);
    await attendance.populate([
      { path: 'meeting', select: 'title date' },
      { path: 'recordedBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: { attendance }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for this participant in this meeting'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error recording attendance',
      error: error.message
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { meetingId, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (meetingId) {
      query.meeting = meetingId;
    }

    const attendance = await Attendance.find(query)
      .populate('meeting', 'title date location')
      .populate('recordedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'meeting', select: 'title date' },
      { path: 'recordedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: { attendance: updatedAttendance }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating attendance',
      error: error.message
    });
  }
};

export const getAttendanceStats = async (req, res) => {
  try {
    const { meetingId } = req.query;
    
    let matchQuery = {};
    if (meetingId) {
      matchQuery.meeting = meetingId;
    }

    const stats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRecords = await Attendance.countDocuments(matchQuery);

    res.json({
      success: true,
      data: {
        stats,
        totalRecords
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance stats',
      error: error.message
    });
  }
};