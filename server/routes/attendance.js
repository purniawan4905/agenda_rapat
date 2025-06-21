import express from 'express';
import {
  recordAttendance,
  getAttendance,
  updateAttendance,
  getAttendanceStats
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAttendance } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateAttendance, recordAttendance);
router.get('/', getAttendance);
router.get('/stats', getAttendanceStats);
router.put('/:id', updateAttendance);

export default router;