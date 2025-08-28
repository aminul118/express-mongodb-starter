import envVars from '../../config/env';
import sendEmail from '../../utils/sendEmail';
import { IContact } from './contact.interface';

const createContact = async (payload: IContact) => {
  // Sent email to User
  await sendEmail({
    to: payload.email,
    subject: `Contact Email Received`,
    templateName: 'contactReply',
    templateData: {
      name: payload.name,
      adminName: envVars.ADMIN_NAME,
    },
  });

  //   Sent email to admin
  await sendEmail({
    to: envVars.ADMIN_EMAIL,
    subject: `${payload.subject}`,
    templateName: 'contactAdmin',
    templateData: {
      name: payload.name,
      email: payload.email,
      message: payload.message,
    },
  });

  return payload;
};

export const ContactServices = {
  createContact,
};
