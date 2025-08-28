import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OTPService } from './otp.service';
import sendOTP from './otp.utils';

const reSendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await sendOTP(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP sent successfully',
    data: null,
  });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await OTPService.verifyOTP(res, email, otp);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP verified successfully',
    data: {
      ...result,
    },
  });
});

export const OTPController = {
  reSendOTP,
  verifyOTP,
};
