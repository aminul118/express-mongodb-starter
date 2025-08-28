import httpStatus from 'http-status-codes';
import crypto from 'crypto';
import { User } from '../user/user.model';
import AppError from '../../errorHelpers/AppError';
import { redisClient } from '../../config/redis.config';
import sendEmail from '../../utils/sendEmail';

const OTP_EXPIRATION = 2 * 60; //2 minutes

// Random 6 digit otp generator
const generateOTP = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};

// Otp send utility Function
const sendOTP = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.isVerified) {
    throw new AppError(httpStatus.NOT_FOUND, 'You are already verified');
  }

  const otp = generateOTP();
  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: 'EX',
      value: OTP_EXPIRATION,
    },
  });

  const fullName = `${user.firstName} ${user.lastName}`;
  await sendEmail({
    to: email,
    subject: 'Your OTP code',
    templateName: 'otp',
    templateData: {
      name: fullName,
      otp,
    },
  });
};

export default sendOTP;
