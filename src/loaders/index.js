import rabbitMQ from './amqp';
import database from './database';

export default async () => {
  await database();
  await rabbitMQ.connect();
};
