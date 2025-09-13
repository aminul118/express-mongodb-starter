import httpStatus from 'http-status-codes';
import { redisClient } from '../../config/redis.config';
import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';
import { setAuthCookie } from '../../utils/setCookie';
import { createUserToken } from '../../utils/userTokens';
import { Response } from 'express';

const verifyOTP = async (res: Response, email: string, otp: string) => {
  const user = await User.findOne({ email }).select('-password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.isVerified) {
    throw new AppError(httpStatus.NOT_FOUND, 'You are already verified');
  }

  const redisKey = `otp:${email}`;

  const savedOtp = await redisClient.get(redisKey);
  if (!savedOtp || savedOtp !== otp) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid OTP');
  }

  await Promise.all([
    await User.updateOne(
      { email },
      { isVerified: true },
      { runValidators: true },
    ),
    await redisClient.del([redisKey]),
  ]);

  // Set cookies that user can login themselves after OTP verification
  const userTokens = createUserToken(user);
  setAuthCookie(res, userTokens);

  return {
    user,
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
  };
};

export const OTPService = {
  verifyOTP,
};
