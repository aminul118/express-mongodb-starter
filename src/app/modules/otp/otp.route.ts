import { Router } from 'express';
import { OTPController } from './otp.controller';

const router = Router();

router.post('/re-send', OTPController.reSendOTP);
router.post('/verify', OTPController.verifyOTP);

export const OTPRouter = router;
