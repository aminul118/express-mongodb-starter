/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import path from 'path';
import AppError from '../errorHelpers/AppError';
import envVars from '../config/env';
import { SendEmailOptions } from '../types';
import httpStatus from 'http-status-codes';

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  port: envVars.EMAIL_SENDER.SMTP_PORT,
  secure: envVars.EMAIL_SENDER.SMTP_PORT === 465, // 465 = SSL; 587 = STARTTLS
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
});

const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log('ERROR-->', error.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Email Sending failed');
  }
};

export default sendEmail;
