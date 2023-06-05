import config from 'config';
import RabbitMQ from '../loaders/amqp';
import logger from '../utils/logger';

/**
 * Publishes a message to a RabbitMQ queue.
 *
 * @param {string} queue - The name of the queue to publish the message to.
 * @param {string} message - The message to be published.
 * @param {object} opts - Additional options for the message.
 * @returns {Promise<void>} A Promise that resolves when the message is published.
 */
const publishToQueue = async (queue, message, opts) => {
  let channel;
  try {
    channel = await RabbitMQ.connection.createChannel();

    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message), opts);

    logger.info(`[RabbitMQ]: Message added to queue: ${queue}`);
  } catch (err) {
    logger.error('[RabbitMQ]:', err.message);
  } finally {
    if (channel) {
      await channel.close();
    }
  }
};

/**
 * Publishes a delayed message to a RabbitMQ queue and republishes it to the specified queue.
 *
 * @param {string} queue - The name of the target queue.
 * @param {string} message - The message to be published.
 * @param {object} opts - Additional options for the message.
 * @returns {Promise<void>} - A Promise that resolves when the message is published.
 */
const publishDelayedMessage = async (queue, message, opts) => {
  const delay_time = config.get('consumer.delay_time');

  const channel = await RabbitMQ.connection.createChannel();

  const DELAY_QUEUE_NAME = `${queue}_delayed`;
  const AFTER_DELAY_QUEUE = queue;
  const TTL = 1000 * 60 * delay_time;

  await channel.assertQueue(DELAY_QUEUE_NAME, {
    deadLetterExchange: '',
    deadLetterRoutingKey: AFTER_DELAY_QUEUE,
  });

  await channel.assertQueue(AFTER_DELAY_QUEUE);

  channel.sendToQueue(DELAY_QUEUE_NAME, Buffer.from(message), { ...opts, persistent: true, expiration: TTL });

  await channel.close();
};

/**
 * Consume messages from a RabbitMQ queue and process them with a given function.
 *
 * @param {string} queue - The name of the queue to consume messages from.
 * @param {Function} func - The function to process each consumed message.
 * @returns {Promise<void>} A Promise that resolves when the consumption is complete.
 */
const consumeToQueue = async (queue, func) => {
  const max_retry_count = config.get('consumer.max_retry_count');
  const prefetch_count = config.get('consumer.prefetch');
  const delay_time = config.get('consumer.delay_time');

  let channel;

  try {
    channel = await RabbitMQ.connection.createChannel();
    // The most optimal prefetch should be calculated and configured for each queue according to its specific characteristics.
    channel.prefetch(prefetch_count);
    RabbitMQ.channels.push(channel);

    await channel.assertQueue(queue);
    logger.info(`[RabbitMQ]: Waiting for messages in ${queue}.`);

    await channel.consume(queue, async (msg) => {
      try {
        await func(msg.content);
        channel.ack(msg);
      } catch (err) {
        const retryCount = (msg.properties.headers['x-retry-count'] || 0) + 1;

        if (retryCount > max_retry_count) {
          logger.error(`[RabbitMQ]: Message rejected from queue ${queue} after ${max_retry_count} retries.`);
          await publishToQueue(`${queue}_errors`, msg.content, {
            headers: {
              'x-retry-count': retryCount,
            },
          });
        } else {
          logger.error(`[RabbitMQ]: Error: ${err.message}. Message requeued to ${queue} after a ${delay_time} min delay.`);
          await publishDelayedMessage(queue, msg.content, {
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

export default { publishToQueue, consumeToQueue, publishDelayedMessage };
