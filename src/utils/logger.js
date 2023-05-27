import config from 'config';
import winston, { format } from 'winston';

const loggerConfig = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5,
  },
  transports: {
    console: {
      level: config.get('logger.console.level'),
      format: format.combine(format.prettyPrint(), format.json()),
    },
    file: {
      level: config.get('logger.file.level'),
      filename: 'logs/error.log',
      format: format.combine(
        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        format.align(),
        format.printf((info) => `${info.level}: ${[info.timestamp]}: ${info.message}`)
      ),
    },
  },
};

const options = {
  levels: loggerConfig.levels,
  transports: [
    new winston.transports.Console(loggerConfig.transports.console),
    new winston.transports.File(loggerConfig.transports.file),
  ],
  silent: config.get('logger.silent'),
};

const logger = new winston.createLogger(options);

export default logger;
