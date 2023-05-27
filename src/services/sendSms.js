import logger from '../utils/logger';

const sendSms = async (customer) => {
    // In this section, the sms sending function can be written. I left it for example.
  logger.info(`Sms sent to customer: ${customer}`);
};

export default sendSms;
