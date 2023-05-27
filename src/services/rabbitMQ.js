import config from 'config';
import RabbitMQ from '../loaders/amqp';
import logger from '../utils/logger';

const MAX_RETRY_COUNT = config.get('consumer.max_retry_count');

/**
 * Publishes a message to a RabbitMQ queue.
 *
 * @param {string} queue - The name of the queue to publish the message to.
 * @param {string} message - The message to be published.
 * @returns {Promise<void>} A Promise that resolves when the message is published.
 */
const publishToQueue = async (queue, message) => {
  let channel;
  try {
    channel = await RabbitMQ.connection.createChannel();

    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message));

    logger.info(`[RabbitMQ]: Message added to queue ${message}`);
  } catch (err) {
    logger.error('[RabbitMQ]:', err.message);
  } finally {
    if (channel) {
      await channel.close();
    }
  }
};

/**
 * Consume messages from a RabbitMQ queue and process them with a given function.
 *
 * @param {string} queue - The name of the queue to consume messages from.
 * @param {Function} func - The function to process each consumed message.
 * @returns {Promise<void>} A Promise that resolves when the consumption is complete.
 */
const consumeToQueue = async (queue, func) => {
  let channel;
  try {
    channel = await RabbitMQ.connection.createChannel();
    RabbitMQ.channels.push(channel);

    await channel.assertQueue(queue);
    logger.info(`[RabbitMQ]: Waiting for messages in ${queue}.`);

    await channel.consume(queue, async (msg) => {
      try {
        await func(msg.content.toString());
        channel.ack(msg);
      } catch (err) {
        const retryCount = (msg.properties.headers['x-retry-count'] || 0) + 1;

        if (retryCount > MAX_RETRY_COUNT) {
          logger.error(`[RabbitMQ]: Message rejected from queue ${queue} after ${MAX_RETRY_COUNT} retries.`);
          channel.sendToQueue('errorQueue', msg.content, {
            headers: {
              'x-retry-count': retryCount,
            },
          });
        } else {
          logger.error(`[RabbitMQ]: Message requeued to ${queue}.`);
          channel.sendToQueue(queue, msg.content, {
            headers: {
              'x-retry-count': retryCount,
            },
          });
        }
        channel.reject(msg, false);
      }
    });
  } catch (err) {
    logger.error('[RabbitMQ]: Error:', err.message);
  }
};

export default { publishToQueue, consumeToQueue };
