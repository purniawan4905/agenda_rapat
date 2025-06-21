import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateMeeting = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide valid start time (HH:MM)'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide valid end time (HH:MM)'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('attendees')
    .isArray({ min: 1 })
    .withMessage('At least one attendee is required'),
  handleValidationErrors
];

export const validateAttendance = [
  body('meeting')
    .isMongoId()
    .withMessage('Valid meeting ID is required'),
  body('participant.name')
    .trim()
    .notEmpty()
    .withMessage('Participant name is required'),
  body('participant.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid participant email is required'),
  body('status')
    .isIn(['present', 'absent', 'late', 'excused'])
    .withMessage('Valid status is required'),
  handleValidationErrors
];

export const validateMeetingMinutes = [
  body('meeting')
    .isMongoId()
    .withMessage('Valid meeting ID is required'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Meeting content must be at least 10 characters'),
  handleValidationErrors
];