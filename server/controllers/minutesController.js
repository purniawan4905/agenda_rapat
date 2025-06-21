import MeetingMinutes from '../models/MeetingMinutes.js';
import Meeting from '../models/Meeting.js';
import Notification from '../models/Notification.js';

export const createMinutes = async (req, res) => {
  try {
    const minutesData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Check if meeting exists
    const meeting = await Meeting.findById(minutesData.meeting);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    const minutes = await MeetingMinutes.create(minutesData);
    await minutes.populate([
      { path: 'meeting', select: 'title date' },
      { path: 'createdBy', select: 'name email' }
    ]);

    // Notify meeting attendees about available minutes
    const notifications = meeting.attendees.map(attendee => ({
      recipient: attendee.user || null,
      type: 'minutes-available',
      title: 'Meeting Minutes Available',
      message: `Minutes for "${meeting.title}" are now available`,
      relatedMeeting: meeting._id
    }));

    await Notification.insertMany(notifications.filter(n => n.recipient));

    res.status(201).json({
      success: true,
      message: 'Meeting minutes created successfully',
      data: { minutes }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Minutes already exist for this meeting'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating meeting minutes',
      error: error.message
    });
  }
};

export const getMinutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, meetingId } = req.query;
    
    let query = {};
    if (meetingId) {
      query.meeting = meetingId;
    }

    const minutes = await MeetingMinutes.find(query)
      .populate('meeting', 'title date location organizer')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MeetingMinutes.countDocuments(query);

    res.json({
      success: true,
      data: {
        minutes,
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
      message: 'Error fetching meeting minutes',
      error: error.message
    });
  }
};

export const getMinutesById = async (req, res) => {
  try {
    const minutes = await MeetingMinutes.findById(req.params.id)
      .populate('meeting', 'title date location organizer attendees')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!minutes) {
      return res.status(404).json({
        success: false,
        message: 'Meeting minutes not found'
      });
    }

    res.json({
      success: true,
      data: { minutes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting minutes',
      error: error.message
    });
  }
};

export const updateMinutes = async (req, res) => {
  try {
    const minutes = await MeetingMinutes.findById(req.params.id);

    if (!minutes) {
      return res.status(404).json({
        success: false,
        message: 'Meeting minutes not found'
      });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };

    const updatedMinutes = await MeetingMinutes.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'meeting', select: 'title date' },
      { path: 'createdBy', select: 'name email' },
      { path: 'lastModifiedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Meeting minutes updated successfully',
      data: { minutes: updatedMinutes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating meeting minutes',
      error: error.message
    });
  }
};

export const approveMinutes = async (req, res) => {
  try {
    const minutes = await MeetingMinutes.findById(req.params.id);

    if (!minutes) {
      return res.status(404).json({
        success: false,
        message: 'Meeting minutes not found'
      });
    }

    const updatedMinutes = await MeetingMinutes.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate([
      { path: 'meeting', select: 'title date' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Meeting minutes approved successfully',
      data: { minutes: updatedMinutes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving meeting minutes',
      error: error.message
    });
  }
};

export const updateActionItem = async (req, res) => {
  try {
    const { minutesId, actionItemId } = req.params;
    const { status, assignedTo, dueDate, priority } = req.body;

    const minutes = await MeetingMinutes.findById(minutesId);
    if (!minutes) {
      return res.status(404).json({
        success: false,
        message: 'Meeting minutes not found'
      });
    }

    const actionItem = minutes.actionItems.id(actionItemId);
    if (!actionItem) {
      return res.status(404).json({
        success: false,
        message: 'Action item not found'
      });
    }

    // Update action item
    if (status) actionItem.status = status;
    if (assignedTo) actionItem.assignedTo = assignedTo;
    if (dueDate) actionItem.dueDate = dueDate;
    if (priority) actionItem.priority = priority;

    await minutes.save();

    res.json({
      success: true,
      message: 'Action item updated successfully',
      data: { actionItem }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating action item',
      error: error.message
    });
  }
};