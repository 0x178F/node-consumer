import logger from '../../utils/logger';
import { connectToDatabase } from './mongoConnect';

export default async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    logger.error('Connection Error:', error);
    throw error;
  }
};
