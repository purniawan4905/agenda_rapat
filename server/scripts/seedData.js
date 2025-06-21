import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Meeting from '../models/Meeting.js';
import Attendance from '../models/Attendance.js';
import MeetingMinutes from '../models/MeetingMinutes.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Meeting.deleteMany({});
    await Attendance.deleteMany({});
    await MeetingMinutes.deleteMany({});
    await Notification.deleteMany({});

    // Create sample users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user'
      }
    ]);

    console.log('Users created');

    // Create sample meetings
    const meetings = await Meeting.create([
      {
        title: 'Weekly Team Standup',
        description: 'Weekly team synchronization meeting to discuss progress and blockers',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: '09:00',
        endTime: '10:00',
        location: 'Conference Room A',
        organizer: users[0]._id,
        attendees: [
          { user: users[1]._id, email: users[1].email, name: users[1].name, status: 'accepted' },
          { user: users[2]._id, email: users[2].email, name: users[2].name, status: 'accepted' },
          { user: users[3]._id, email: users[3].email, name: users[3].name, status: 'tentative' }
        ],
        status: 'scheduled',
        meetingType: 'in-person',
        priority: 'medium'
      },
      {
        title: 'Project Planning Session',
        description: 'Planning session for the new product launch',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        startTime: '14:00',
        endTime: '16:00',
        location: 'Virtual - Zoom',
        organizer: users[1]._id,
        attendees: [
          { user: users[0]._id, email: users[0].email, name: users[0].name, status: 'accepted' },
          { user: users[2]._id, email: users[2].email, name: users[2].name, status: 'invited' }
        ],
        status: 'scheduled',
        meetingType: 'virtual',
        priority: 'high'
      },
      {
        title: 'Monthly Review',
        description: 'Monthly performance and goals review',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        startTime: '11:00',
        endTime: '12:00',
        location: 'Conference Room B',
        organizer: users[0]._id,
        attendees: [
          { user: users[1]._id, email: users[1].email, name: users[1].name, status: 'accepted' },
          { user: users[2]._id, email: users[2].email, name: users[2].name, status: 'accepted' }
        ],
        status: 'completed',
        meetingType: 'in-person',
        priority: 'medium'
      }
    ]);

    console.log('Meetings created');

    // Create sample attendance records
    await Attendance.create([
      {
        meeting: meetings[2]._id, // Monthly Review
        participant: {
          user: users[1]._id,
          name: users[1].name,
          email: users[1].email
        },
        status: 'present',
        checkInTime: new Date(meetings[2].date.getTime() + 5 * 60 * 1000), // 5 minutes after start
        recordedBy: users[0]._id
      },
      {
        meeting: meetings[2]._id,
        participant: {
          user: users[2]._id,
          name: users[2].name,
          email: users[2].email
        },
        status: 'late',
        checkInTime: new Date(meetings[2].date.getTime() + 15 * 60 * 1000), // 15 minutes after start
        notes: 'Traffic delay',
        recordedBy: users[0]._id
      }
    ]);

    console.log('Attendance records created');

    // Create sample meeting minutes
    await MeetingMinutes.create([
      {
        meeting: meetings[2]._id,
        content: `
          Monthly Review Meeting Minutes
          
          Attendees: Admin User, John Doe, Jane Smith
          
          Agenda:
          1. Review of last month's performance
          2. Discussion of upcoming goals
          3. Resource allocation
          
          Discussion Points:
          - Team exceeded targets by 15%
          - New project requirements discussed
          - Budget approval needed for additional resources
          
          Next Steps:
          - Prepare budget proposal
          - Schedule follow-up meetings with stakeholders
        `,
        summary: 'Monthly review showed strong performance with 15% target exceeded. Budget proposal needed for new resources.',
        actionItems: [
          {
            description: 'Prepare detailed budget proposal for additional resources',
            assignedTo: {
              user: users[1]._id,
              name: users[1].name,
              email: users[1].email
            },
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'pending',
            priority: 'high'
          },
          {
            description: 'Schedule stakeholder meetings for next week',
            assignedTo: {
              user: users[2]._id,
              name: users[2].name,
              email: users[2].email
            },
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            priority: 'medium'
          }
        ],
        decisions: [
          'Approved 15% budget increase for Q4',
          'Decided to hire 2 additional team members',
          'Monthly reviews will now include client feedback section'
        ],
        keyPoints: [
          'Team performance exceeded expectations',
          'Client satisfaction scores improved',
          'New project timeline approved'
        ],
        createdBy: users[0]._id,
        isApproved: true,
        approvedBy: users[0]._id,
        approvedAt: new Date()
      }
    ]);

    console.log('Meeting minutes created');

    // Create sample notifications
    await Notification.create([
      {
        recipient: users[1]._id,
        type: 'meeting-reminder',
        title: 'Upcoming Meeting Reminder',
        message: 'You have a meeting "Weekly Team Standup" scheduled for tomorrow at 09:00',
        relatedMeeting: meetings[0]._id,
        priority: 'medium'
      },
      {
        recipient: users[2]._id,
        type: 'action-item',
        title: 'Action Item Due Soon',
        message: 'Your action item "Schedule stakeholder meetings" is due in 2 days',
        priority: 'high'
      },
      {
        recipient: users[1]._id,
        type: 'minutes-available',
        title: 'Meeting Minutes Available',
        message: 'Minutes for "Monthly Review" meeting are now available for review',
        relatedMeeting: meetings[2]._id,
        isRead: false,
        priority: 'low'
      }
    ]);

    console.log('Notifications created');
    console.log('Sample data seeded successfully!');
    
    console.log('\nSample login credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('User: bob@example.com / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();