import { z } from 'zod';
import { IsActive, Role } from './user.interface';

// Helper for type error + required field message
const requiredString = (fieldName: string, min?: number, max?: number) => {
  let schema = z.string({
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be a string`,
  });

  if (min)
    schema = schema.min(min, {
      message: `${fieldName} must be at least ${min} characters`,
    });
  if (max)
    schema = schema.max(max, {
      message: `${fieldName} must be at most ${max} characters`,
    });

  return schema;
};

// Auth provider schema
const authProviderZodSchema = z.object({
  provider: z.enum(['google', 'credentials'], {
    required_error: 'Provider is required',
    invalid_type_error: 'Invalid provider',
  }),
  providerId: requiredString('Provider ID'),
});
// const createUserZodSchema = z
//   .object({
//     name: requiredString('Name', 5, 50),
//     email: z
//       .string({ required_error: 'Email is required' })
//       .email({ message: 'Invalid email format' }),
//     password: z
//       .string({ required_error: 'Password is required' })
//       .min(8, { message: 'Password must be at least 8 characters' })
//       .regex(/[A-Z]/, { message: 'Must include at least one uppercase letter' })
//       .regex(/[a-z]/, { message: 'Must include at least one lowercase letter' })
//       .regex(/[^a-zA-Z0-9]/, {
//         message: 'Must include at least one special character',
//       }),
//     phone: z.string().optional(),
//     address: z.string().optional(),
//   })
//   .strict();

const createUserZodSchema = z
  .object({
    firstName: requiredString('First name', 2, 30),
    lastName: requiredString('Last name', 2, 30),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email format' }),

    password: z
      .string({ required_error: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Must include at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Must include at least one lowercase letter' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Must include at least one special character',
      }),
    phone: requiredString('Phone'),
    address: z
      .string()
      .max(200, { message: 'Maximum length 200 characters' })
      .optional(),
  })
  .strict();

const updateUserZodSchema = z
  .object({
    firstName: z.string().min(2).max(30).optional(),
    lastName: z.string().min(2).max(30).optional(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Must include at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Must include at least one lowercase letter' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Must include at least one special character',
      })
      .optional(),
    role: z.nativeEnum(Role).optional(),
    phone: z.string().optional(),
    address: z.string().max(200).optional(),
    picture: z.string().optional(),
    isDeleted: z.boolean().optional(),
    isActive: z.nativeEnum(IsActive).optional(),
    isVerified: z.boolean().optional(),
    auths: z.array(authProviderZodSchema).optional(),
  })
  .strict();

export const userValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
