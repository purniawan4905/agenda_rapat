# Meeting Management System - Backend API

A comprehensive backend API for managing meetings, attendance, minutes, and notifications built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Password hashing with bcrypt
  - Secure user registration and login

- **Meeting Management**
  - Create, read, update, delete meetings
  - Meeting status tracking (scheduled, ongoing, completed, cancelled)
  - Attendee management with invitation status
  - Meeting statistics and analytics

- **Attendance Tracking**
  - Record attendance with multiple status options
  - Check-in/check-out time tracking
  - Attendance statistics and reports
  - Notes and comments for attendance records

- **Meeting Minutes**
  - Rich text meeting minutes with action items
  - Decision tracking and key points
  - Action item assignment and status tracking
  - Minutes approval workflow

- **Notification System**
  - Real-time notifications for meeting updates
  - Email notifications for reminders
  - Action item due date reminders
  - Customizable notification preferences

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/meeting_management
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Seed Sample Data (Optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/:id` - Get specific meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `GET /api/meetings/stats` - Get meeting statistics

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Record attendance
- `PUT /api/attendance/:id` - Update attendance
- `GET /api/attendance/stats` - Get attendance statistics

### Meeting Minutes
- `GET /api/minutes` - Get all meeting minutes
- `POST /api/minutes` - Create meeting minutes
- `GET /api/minutes/:id` - Get specific minutes
- `PUT /api/minutes/:id` - Update minutes
- `PUT /api/minutes/:id/approve` - Approve minutes
- `PUT /api/minutes/:minutesId/action-items/:actionItemId` - Update action item

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'user'],
  isActive: Boolean,
  lastLogin: Date,
  profileImage: String
}
```

### Meeting Model
```javascript
{
  title: String,
  description: String,
  date: Date,
  startTime: String,
  endTime: String,
  location: String,
  organizer: ObjectId (User),
  attendees: [{
    user: ObjectId (User),
    email: String,
    name: String,
    status: ['invited', 'accepted', 'declined', 'tentative']
  }],
  status: ['scheduled', 'ongoing', 'completed', 'cancelled'],
  meetingType: ['in-person', 'virtual', 'hybrid'],
  priority: ['low', 'medium', 'high', 'urgent']
}
```

### Attendance Model
```javascript
{
  meeting: ObjectId (Meeting),
  participant: {
    user: ObjectId (User),
    name: String,
    email: String
  },
  status: ['present', 'absent', 'late', 'excused'],
  checkInTime: Date,
  checkOutTime: Date,
  notes: String,
  recordedBy: ObjectId (User)
}
```

### Meeting Minutes Model
```javascript
{
  meeting: ObjectId (Meeting),
  content: String,
  summary: String,
  actionItems: [{
    description: String,
    assignedTo: {
      user: ObjectId (User),
      name: String,
      email: String
    },
    dueDate: Date,
    status: ['pending', 'in-progress', 'completed', 'cancelled'],
    priority: ['low', 'medium', 'high']
  }],
  decisions: [String],
  keyPoints: [String],
  createdBy: ObjectId (User),
  isApproved: Boolean,
  approvedBy: ObjectId (User)
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Express Validator for request validation
- **Role-based Access**: Admin and user role permissions

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database constraint violations
- Rate limiting responses
- Graceful server shutdown

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Seeding
```bash
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use a process manager like PM2
6. Set up monitoring and logging

## Sample Data

The seed script creates sample data including:
- 4 sample users (1 admin, 3 regular users)
- 3 sample meetings with different statuses
- Attendance records for completed meetings
- Meeting minutes with action items
- Sample notifications

**Sample Login Credentials:**
- Admin: `admin@example.com` / `password123`
- User: `john@example.com` / `password123`
- User: `jane@example.com` / `password123`
- User: `bob@example.com` / `password123`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.