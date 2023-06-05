import config from 'config';
import amqplib from 'amqplib';
import logger from '../../utils/logger';
import QUEUES from '../../enums/queues';

/**
 * An AMQP connection manager.
 */
class AmqpConnect {
  constructor() {
    /**
     * The URL of the RabbitMQ server to connect to.
     * @type {string}
     */
    this.rabbitmqURL = config.get('connection.rabbitMQ');

    /**
     * The AMQP connection object.
     * @type {import('amqplib').Connection | null}
     */
    this.connection = null;

    /**
     * @type {import('amqplib').Channel | null}
     *  RabbitMQ recommends using a single channel per thread as best practice.
     */
    this.channel = null;
  }

  /**
   * Connects to the RabbitMQ server.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the connection has been established.
   * @throws {Error} If an error occurs while connecting to the RabbitMQ server.
   */
  async connect() {
    try {
      const conn = await amqplib.connect(this.rabbitmqURL);

      conn.on('close', () => {
        logger.info('[RabbitMQ]: reconnecting!');
        setTimeout(this.connect.bind(this), 3000);
      });

      logger.info('[RabbitMQ]: Connected!');

      this.channel = await conn.createChannel();
      this.connection = conn;
    } catch (err) {
      if (!this.isExpectedError(err)) {
        logger.error('[RabbitMQ]:', err.message);
        throw err;
      }
    }
  }

  /**
   * Controls the shutdown of the AMQP connection.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the connection has been closed.
   * @throws {Error} If an error occurs while closing the connection.
   */
  async shutDown() {
    try {
      const connection = this.connection;
      if (!connection) return;

      const queues = Object.keys(QUEUES);

      let hasMessages = false;

      while (true) {
        for (const queue of queues) {
          const queueInfo = await this.channel.assertQueue(queue);
          const totalQueueMessage = queueInfo.messageCount;

          logger.info(`[RabbitMQ]: ${totalQueueMessage} messages left in the ${queue} queue`);

          if (totalQueueMessage > 0) {
            hasMessages = true;
            continue;
          }
        }

        if (!hasMessages) {
          logger.info('[RabbitMQ]: There are no messages left in any queue.');
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      await this.channel.close();
      await connection.close();

      logger.info('[RabbitMQ]: connection closed.');
    } catch (err) {
      if (!this.isExpectedError(err)) {
        logger.error('Error occurred while closing RabbitMQ:', err.message);
        throw err;
      }
    }
  }

  /**
   * Checks if the given error is an expected network error.
   *
   * @param {Error} err - The error to check.
   * @returns {boolean} - Returns `true` if the error is expected, otherwise `false`.
   */
  isExpectedError(err) {
    if (err instanceof amqplib.IllegalOperationError) {
      return true;
    }

    // https://github.com/amqp-node/amqplib/issues/250
    if (err.message.match(/no reply will be forthcoming/)) {
      return true;
    }
  }
}

const RabbitMQ = new AmqpConnect();

export default RabbitMQ;
