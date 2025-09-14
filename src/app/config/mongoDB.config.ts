/* eslint-disable no-console */
import mongoose from 'mongoose';
import envVars from './env';

const connectDB = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.log('MongoDB Connection failed', error);
  }
};

export default connectDB;
