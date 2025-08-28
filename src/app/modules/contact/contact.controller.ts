import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';
import { ContactServices } from './contact.service';

const createContact = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await ContactServices.createContact(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message sent successfully',
    data,
  });
});

export const ContactController = {
  createContact,
};
