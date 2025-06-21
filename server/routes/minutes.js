import express from 'express';
import {
  createMinutes,
  getMinutes,
  getMinutesById,
  updateMinutes,
  approveMinutes,
  updateActionItem
} from '../controllers/minutesController.js';
import { authenticate } from '../middleware/auth.js';
import { validateMeetingMinutes } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateMeetingMinutes, createMinutes);
router.get('/', getMinutes);
router.get('/:id', getMinutesById);
router.put('/:id', updateMinutes);
router.put('/:id/approve', approveMinutes);
router.put('/:minutesId/action-items/:actionItemId', updateActionItem);

export default router;