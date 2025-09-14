import dotenv from 'dotenv';
import path from 'path';

// Decide file based on NODE_ENV
const isProd = process.env.NODE_ENV === 'production';
export const envFile = isProd ? '.env.production' : '.env.local';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: 'development' | 'production';
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  BCRYPT_SALT_ROUND: number;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  EXPRESS_SESSION_SECRET: string;
  FRONTEND_URL: string;
  ADMIN_NAME: string;
  ADMIN_EMAIL: string;
  CLOUDINARY: {
    CLOUDINARY_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  EMAIL_SENDER: {
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string; // rename here
  };
  REDIS: {
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_USERNAME: string;
    REDIS_PASSWORD: string;
  };
}

// Helper to fetch env vars
const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
};

const loadEnvVariables = (): EnvConfig => ({
  PORT: getEnv('PORT'),
  DB_URL: getEnv('DB_URL'),
  NODE_ENV: getEnv('NODE_ENV') as 'development' | 'production',
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  JWT_ACCESS_EXPIRES: getEnv('JWT_ACCESS_EXPIRES'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES: getEnv('JWT_REFRESH_EXPIRES'),
  BCRYPT_SALT_ROUND: Number(getEnv('BCRYPT_SALT_ROUND')),
  SUPER_ADMIN_EMAIL: getEnv('SUPER_ADMIN_EMAIL'),
  SUPER_ADMIN_PASSWORD: getEnv('SUPER_ADMIN_PASSWORD'),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: getEnv('GOOGLE_CALLBACK_URL'),
  EXPRESS_SESSION_SECRET: getEnv('EXPRESS_SESSION_SECRET'),
  FRONTEND_URL: getEnv('FRONTEND_URL'),
  ADMIN_NAME: getEnv('ADMIN_NAME'),
  ADMIN_EMAIL: getEnv('ADMIN_EMAIL'),
  CLOUDINARY: {
    CLOUDINARY_NAME: getEnv('CLOUDINARY_NAME'),
    CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
    CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
  },
  EMAIL_SENDER: {
    SMTP_HOST: getEnv('SMTP_HOST'),
    SMTP_PORT: Number(getEnv('SMTP_PORT')),
    SMTP_USER: getEnv('SMTP_USER'),
    SMTP_PASS: getEnv('SMTP_PASS'),
    SMTP_FROM: getEnv('SMTP_FROM'),
  },
  REDIS: {
    REDIS_HOST: getEnv('REDIS_HOST'),
    REDIS_PORT: Number(getEnv('REDIS_PORT')),
    REDIS_USERNAME: getEnv('REDIS_USERNAME'),
    REDIS_PASSWORD: getEnv('REDIS_PASSWORD'),
  },
});

const envVars = loadEnvVariables();
export default envVars;
