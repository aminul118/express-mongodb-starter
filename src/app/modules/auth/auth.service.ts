/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';
import httpStatus from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import { createNewAccessTokenWithRefreshToken } from '../../utils/userTokens';
import { JwtPayload } from 'jsonwebtoken';
import envVars from '../../config/env';
import { IAuthProvider, IsActive } from '../user/user.interface';
import jwt from 'jsonwebtoken';
import sendEmail from '../../utils/sendEmail';

const getNewAccessToken = async (refreshToken: string) => {
  return await createNewAccessTokenWithRefreshToken(refreshToken);
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isOldPassword = await bcryptjs.compare(
    oldPassword,
    user.password as string,
  );

  if (!isOldPassword) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password doesn't match");
  }

  user.password = await bcryptjs.hash(newPassword, envVars.BCRYPT_SALT_ROUND);
  await user.save();
};

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (
    user.password &&
    user.auths.some((providerObj) => providerObj.provider === 'google')
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already set password. Now you can change the password from your profile password update',
    );
  }

  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    envVars.BCRYPT_SALT_ROUND,
  );

  const credentialProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: user.email,
  };

  const auths: IAuthProvider[] = [...user.auths, credentialProvider];
  user.password = hashedPassword;
  user.auths = auths;
  await user.save();
};

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist');
  }
  if (!isUserExist.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is not verified');
  }
  if (
    isUserExist.isActive === IsActive.BLOCKED ||
    isUserExist.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.isActive}`,
    );
  }
  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is deleted');
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: '10m',
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
  const fullName = `${isUserExist.firstName} ${isUserExist.lastName}`;

  sendEmail({
    to: isUserExist.email,
    subject: 'Password Reset',
    templateName: 'forgetPassword',
    templateData: {
      name: fullName,
      resetUILink,
    },
  });
};

const resetPassword = async (
  payload: Record<string, any>,
  decodedToken: JwtPayload,
) => {
  if (payload.id != decodedToken.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can not reset your password');
  }

  const isUserExist = await User.findById(decodedToken.userId);
  if (!isUserExist) {
    throw new AppError(httpStatus.FORBIDDEN, 'User does not exist');
  }

  const hashedPassword = await bcryptjs.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  isUserExist.password = hashedPassword;

  await isUserExist.save();
};

export const AuthServices = {
  getNewAccessToken,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword,
};
