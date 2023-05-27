import loaders from './loaders';
import Express from 'express';
import logger from './utils/logger';
import config from 'config';
import gracefulShutdown from './utils/shutdown/gracefulShutdown';
import RabbitMQ from './services/rabbitMQ';
import QUEUES from './enums/queues';

await loaders();

const app = Express();
const port = config.get('connection.port');

const server = app.listen(port, () => {
  logger.info(`[Express]: Server listening at http://localhost:${port}!`);
});

await new Promise((resolve) => server.on('listening', resolve));

app.get('/health', (req, res) =>
  res.status(200).send({
    uptime: `${Math.floor(Math.floor(process.uptime() * 1000) / 60000)} min.`,
    status: true,
  })
);

/**
 * Gracefully shuts down the Express server.
 * @returns {Promise<void>} Resolves when the server is successfully closed.
 */
export const shutDownExpressServer = () => {
  return new Promise((resolve, reject) => {
    if (!server) resolve();
    server.close(() => {
      logger.info('[SERVER]: Shutdown the express server.');
      resolve();
    });
  });
};

// Signal handlers for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Consume queues
const queues = Object.keys(QUEUES);
for (const queue of queues) {
  RabbitMQ.consumeToQueue(queue, QUEUES[queue]);
}
