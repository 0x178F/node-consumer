import Mongoose from 'mongoose';
import config from 'config';
import logger from '../../utils/logger';

const connection = Mongoose.connection;

connection.once('open', () => {
  logger.info('[MongoDB]: Core Database Connected!');
});

const connectToDatabase = async () => {
  if (!config.has('connection.mongoDB')) return;
  const mongoUrl = config.get('connection.mongoDB');
  await Mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
};

const shutDownMongoConnection = async () => {
  try {
    await connection.close();
    logger.info('[MongoDB]: connection closed.');
  } catch (err) {
    logger.error('[MongoDB]: An error occurred while closing connection:', err.message);
  }
};

export { connectToDatabase, shutDownMongoConnection };
