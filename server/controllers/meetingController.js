import Meeting from '../models/Meeting.js';
import Notification from '../models/Notification.js';

export const createMeeting = async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      organizer: req.user.id
    };

    const meeting = await Meeting.create(meetingData);
    await meeting.populate('organizer', 'name email');

    // Create notifications for attendees
    const notifications = meeting.attendees.map(attendee => ({
      recipient: attendee.user || null,
      type: 'meeting-reminder',
      title: 'New Meeting Invitation',
      message: `You have been invited to "${meeting.title}" on ${meeting.date.toDateString()}`,
      relatedMeeting: meeting._id,
      scheduledFor: new Date(meeting.date.getTime() - 24 * 60 * 60 * 1000) // 24 hours before
    }));

    await Notification.insertMany(notifications.filter(n => n.recipient));

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: { meeting }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating meeting',
      error: error.message
    });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date, search } = req.query;
    
    let query = {};
    
    // Filter by organizer or attendee
    query.$or = [
      { organizer: req.user.id },
      { 'attendees.user': req.user.id }
    ];

    // Additional filters
    if (status) query.status = status;
    if (date) {
      const searchDate = new Date(date);
      query.date = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }

    const meetings = await Meeting.find(query)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(query);

    res.json({
      success: true,
      data: {
        meetings,
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
      message: 'Error fetching meetings',
      error: error.message
    });
  }
};

export const getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user has access to this meeting
    const hasAccess = meeting.organizer._id.toString() === req.user.id ||
                     meeting.attendees.some(attendee => 
                       attendee.user && attendee.user._id.toString() === req.user.id
                     );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { meeting }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting',
      error: error.message
    });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is organizer
    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only organizer can update meeting'
      });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    // Notify attendees about update
    const notifications = updatedMeeting.attendees.map(attendee => ({
      recipient: attendee.user || null,
      type: 'meeting-update',
      title: 'Meeting Updated',
      message: `Meeting "${updatedMeeting.title}" has been updated`,
      relatedMeeting: updatedMeeting._id
    }));

    await Notification.insertMany(notifications.filter(n => n.recipient));

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      data: { meeting: updatedMeeting }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating meeting',
      error: error.message
    });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is organizer
    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only organizer can delete meeting'
      });
    }

    await Meeting.findByIdAndDelete(req.params.id);

    // Notify attendees about cancellation
    const notifications = meeting.attendees.map(attendee => ({
      recipient: attendee.user || null,
      type: 'meeting-cancelled',
      title: 'Meeting Cancelled',
      message: `Meeting "${meeting.title}" has been cancelled`,
      relatedMeeting: meeting._id
    }));

    await Notification.insertMany(notifications.filter(n => n.recipient));

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting meeting',
      error: error.message
    });
  }
};

export const getMeetingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Meeting.aggregate([
      {
        $match: {
          $or: [
            { organizer: userId },
            { 'attendees.user': userId }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalMeetings = await Meeting.countDocuments({
      $or: [
        { organizer: userId },
        { 'attendees.user': userId }
      ]
    });

    const upcomingMeetings = await Meeting.countDocuments({
      $or: [
        { organizer: userId },
        { 'attendees.user': userId }
      ],
      date: { $gte: new Date() },
      status: 'scheduled'
    });

    res.json({
      success: true,
      data: {
        stats,
        totalMeetings,
        upcomingMeetings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting stats',
      error: error.message
    });
  }
};