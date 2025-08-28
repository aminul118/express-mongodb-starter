import { Schema, model } from 'mongoose';
import { IContact } from './contact.interface';

const emailRegex = new RegExp(
  '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@(([^<>()[\\]\\.,;:\\s@"]+\\.)+[^<>()[\\]\\.,;:\\s@"]{2,})$',
  'i',
);

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      match: [emailRegex, 'Please fill a valid email address'],
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Contact = model<IContact>('Contact', contactSchema);

export { Contact };
