/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errorHelpers/AppError';
import { setAuthCookie } from '../../utils/setCookie';
import envVars from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { createUserToken } from '../../utils/userTokens';
import passport from 'passport';

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) {
        return next(
          new AppError(err.statusCode || httpStatus.UNAUTHORIZED, err),
        );
      }

      if (!user) {
        return next(new AppError(httpStatus.UNAUTHORIZED, info.message));
      }

      const userTokens = await createUserToken(user);

      const { password: pass, ...rest } = user.toObject();

      setAuthCookie(res, userTokens);

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Logged In Successfully',
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  },
);

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No refresh token received from cookies',
    );
  }
  const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

  setAuthCookie(res, tokenInfo);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'New Access Token Retrieved Successfully',
    data: tokenInfo,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logout successfully',
    data: null,
  });
});

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword, oldPassword } = req.body.newPassword;
    const decodedToken = req.user;

    await AuthServices.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password Changed Successfully',
      data: null,
    });
  },
);

const setPassword = catchAsync(async (req: Request, res: Response) => {
  const { plainPassword } = req.body;
  const decodedToken = req.user as JwtPayload;
  await AuthServices.setPassword(decodedToken.userId, plainPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password Set successfully',
    data: null,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthServices.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email Sent successfully',
    data: null,
  });
});

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password Changed Successfully',
      data: null,
    });
  },
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response) => {
    let redirectTo = req.query.state ? (req.query.state as string) : '';

    if (redirectTo.startsWith('/')) {
      redirectTo = redirectTo.slice(1);
    }

    const user = req.user;

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User Not Found');
    }

    const tokenInfo = createUserToken(user);

    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  },
);

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  setPassword,
  forgotPassword,
  changePassword,
  googleCallbackController,
};
