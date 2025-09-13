import { Types } from 'mongoose';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum IsActive {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export interface IAuthProvider {
  provider: 'google' | 'credentials';
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  picture?: string;
  password: string;
  role: Role;
  userId?: number;
  isDeleted?: string;
  isActive?: IsActive;
  isVerified?: boolean;
  auths: IAuthProvider[];
}
