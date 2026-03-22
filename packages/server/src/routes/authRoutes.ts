import { Router } from 'express';
import { AuthController, GoogleAuthController } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/resend-otp', AuthController.resendOtp);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.get('/google', GoogleAuthController.redirectToGoogle);
router.post('/google-callback', GoogleAuthController.googleCallback);
router.get('/profile', protect, AuthController.getProfile);

export default router;