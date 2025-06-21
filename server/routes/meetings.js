import express from 'express';
import {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingStats
} from '../controllers/meetingController.js';
import { authenticate } from '../middleware/auth.js';
import { validateMeeting } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateMeeting, createMeeting);
router.get('/', getMeetings);
router.get('/stats', getMeetingStats);
router.get('/:id', getMeeting);
router.put('/:id', validateMeeting, updateMeeting);
router.delete('/:id', deleteMeeting);

export default router;