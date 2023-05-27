import { shutDownMongoConnection } from '../../loaders/database/mongoConnect';
import { shutDownExpressServer } from '../../app';
import RabbitMQ from '../../loaders/amqp';
import logger from '../logger';

/**
 * Gracefully shuts down the application.
 */
const gracefulShutdown = async () => {
  logger.info('[APP]: Kill signal received, gracefully shutting down.');

  try {
    await shutDownExpressServer();
    await RabbitMQ.shutDown();
    await shutDownMongoConnection();

    logger.info('[APP]: System shut down.');

    process.exit(0);
  } catch (err) {
    logger.error('[APP]: Shutdown Error:', err.message);
    process.exit(1);
  }
};

export default gracefulShutdown;
