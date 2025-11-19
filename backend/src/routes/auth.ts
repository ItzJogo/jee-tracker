import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { verifyToken } from '../utils/jwt';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getMe);

export default router;
