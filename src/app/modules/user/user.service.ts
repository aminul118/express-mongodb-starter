import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { User } from './user.model';
import bcryptjs from 'bcryptjs';
import envVars from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { IAuthProvider, IUser, Role } from './user.interface';
import sendOTP from '../otp/otp.utils';
import runQueryBuilder from '../../utils/runQueryBuilder';
import { userSearchableField } from './user.constant';

const createUserService = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exits');
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    envVars.BCRYPT_SALT_ROUND,
  );

  const authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email as string,
  };

  const user = await User.create({
    ...rest,
    email,
    picture: payload?.picture,
    password: hashedPassword,
    auths: [authProvider],
  });

  await sendOTP(user.email);

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload,
) => {
  // Check user identity or role
  if (decodedToken.role === Role.USER || decodedToken.role === Role.ADMIN) {
    if (userId !== decodedToken.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }
  }

  // Ensure target user exists
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  //  Admin cannot update Super Admin
  if (
    decodedToken.role === Role.ADMIN &&
    isUserExist.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  // Disallow updating email
  if (payload.email) {
    throw new AppError(httpStatus.FORBIDDEN, 'Email cannot be updated');
  }

  //  Handle password hashing if provided
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND,
    );
  }

  // Handle restricted fields: role, isDeleted, isActive, isVerified
  if (payload.role) {
    if (decodedToken.role !== Role.SUPER_ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only Super Admin can update role',
      );
    }
  }

  if (payload.isDeleted || payload.isActive || payload.isVerified) {
    if (decodedToken.role === Role.USER) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
    }
  }

  // Update user safely
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true, // ensure mongoose validation runs
  });

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found after update');
  }

  return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  return await runQueryBuilder(User, query, userSearchableField);
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  return user;
};

export const userServices = {
  createUserService,
  updateUser,
  getAllUsers,
  getMe,
};
