import { NextFunction, Request, Response } from 'express';
import AppError from '../errorHelpers/AppError';
import { verifyToken } from '../utils/jwt';
import envVars from '../config/env';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import { IsActive } from '../modules/user/user.interface';

const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(httpStatus.BAD_GATEWAY, 'No token received');
      }
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;

      if (!verifiedToken) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not permitted');
      }

      const isUserExist = await User.findOne({ email: verifiedToken.email });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist');
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

      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User isn't verified");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };

export default checkAuth;
