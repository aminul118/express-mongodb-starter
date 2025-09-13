/* eslint-disable no-console */
import mongoose from 'mongoose';
import envVars from './env';

const dbConnect = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log('🚀 Connected to MongoDB');
  } catch (error) {
    console.log('DB Connection failed', error);
  }
};

export default dbConnect;
