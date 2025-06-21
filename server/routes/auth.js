import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;