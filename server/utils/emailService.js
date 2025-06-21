import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendMeetingInvitation = async (meeting, attendeeEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: attendeeEmail,
    subject: `Meeting Invitation: ${meeting.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Meeting Invitation</h2>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${meeting.title}</h3>
          <p><strong>Date:</strong> ${meeting.date.toDateString()}</p>
          <p><strong>Time:</strong> ${meeting.startTime} - ${meeting.endTime}</p>
          <p><strong>Location:</strong> ${meeting.location}</p>
          <p><strong>Description:</strong> ${meeting.description}</p>
        </div>
        <p>Please confirm your attendance.</p>
        <p>Best regards,<br>Meeting Management System</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Meeting invitation sent to:', attendeeEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendMeetingReminder = async (meeting, attendeeEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: attendeeEmail,
    subject: `Meeting Reminder: ${meeting.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Meeting Reminder</h2>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${meeting.title}</h3>
          <p><strong>Date:</strong> ${meeting.date.toDateString()}</p>
          <p><strong>Time:</strong> ${meeting.startTime} - ${meeting.endTime}</p>
          <p><strong>Location:</strong> ${meeting.location}</p>
        </div>
        <p>This is a reminder for your upcoming meeting.</p>
        <p>Best regards,<br>Meeting Management System</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Meeting reminder sent to:', attendeeEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendActionItemReminder = async (actionItem, userEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Action Item Reminder: ${actionItem.description}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Action Item Reminder</h2>
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Action Item Due</h3>
          <p><strong>Description:</strong> ${actionItem.description}</p>
          <p><strong>Due Date:</strong> ${actionItem.dueDate.toDateString()}</p>
          <p><strong>Priority:</strong> ${actionItem.priority}</p>
          <p><strong>Status:</strong> ${actionItem.status}</p>
        </div>
        <p>Please complete this action item by the due date.</p>
        <p>Best regards,<br>Meeting Management System</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Action item reminder sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};