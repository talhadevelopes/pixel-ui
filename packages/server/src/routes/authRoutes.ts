import express from 'express';
import { AuthController } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/resend-otp', AuthController.resendOtp);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.get('/google', AuthController.redirectToGoogle);
router.post('/google-callback', AuthController.googleCallback);
router.get('/profile', protect, AuthController.getProfile);

export default router;