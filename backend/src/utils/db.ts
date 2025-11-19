import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @param uri - MongoDB connection URI
 * @returns Promise that resolves when connected
 */
export const connectDB = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 * @returns Promise that resolves when disconnected
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected successfully');
  } catch (error) {
    console.error('✗ MongoDB disconnection error:', error);
  }
};
