/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SendEmailOptions {
  to: string;
  bcc?: string[];
  cc?: string[];
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}
