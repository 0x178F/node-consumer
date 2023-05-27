import logger from '../utils/logger';

const sendMail = async (customer) => {
  // In this section, the mail sending function can be written. I left it for example.
  logger.info(`Mail sent to customer: ${customer}`);
};

export default sendMail;
