import sendMail from '../services/sendMail';
import sendSms from '../services/sendSms';

export default Object.freeze({
  MAIL: async (message) => await sendMail(message),
  SMS: async (message) => await sendSms(message),
});
