import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { User } from './user.model';
import bcryptjs from 'bcryptjs';
import envVars from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { IAuthProvider, IUser, Role } from './user.interface';
import sendOTP from '../otp/otp.utils';

const createUserService = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email is required');
  }
  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exits');
  }

  const hashedPassword = await bcryptjs.hash(password as string, envVars.BCRYPT_SALT_ROUND);

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

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  /**
   * email - can not update
   * name,phone, password, address
   * password: re hashing
   * role, isDeleted - admin , supper admin can handle
   *
   * promoting to superAdmin - superAdmin only can handle
   */
  if (payload.role) {
    if (decodedToken.role === Role.ENTREPRENEUR || decodedToken.role === Role.INVESTOR) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
    }

    if (payload.password) {
      payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND);
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {
      new: true,
    });

    return newUpdateUser;
  }
};

const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  return user;
};

const getMyCompanyProfile = async (userId: string) => {
  const user = await User.findById(userId).select(
    'investor_profile entrepreneur_profile mentor_profile',
  );

  if (!user) return null;

  let profile = null;

  if (user.investor_profile) {
    profile = await user.populate('investor_profile');
    return profile.investor_profile;
  }

  if (user.entrepreneur_profile) {
    profile = await user.populate('entrepreneur_profile');
    return profile;
  }
  if (user.mentor_profile) {
    profile = await user.populate('mentor_profile');
    return profile;
  }

  return null;
};

export const userServices = {
  createUserService,
  updateUser,
  getAllUsers,
  getMe,
  getMyCompanyProfile,
};
