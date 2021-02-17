const { transports, createLogger, format } = require('winston');
const keys = require('../config/keys')
require('winston-mongodb');

// описание логирования
const LoggerInstance = createLogger({
    format: format.combine(
        format.timestamp(),
        format.simple(),
    ),
    transports: [
        new transports.File({
            filename: `${keys.LOGS_DIR}/error.log`,
            level: 'error',
            maxsize: keys.logs.maxLogFileSizeBytes,
        }),
        new transports.File({
            filename: `${keys.LOGS_DIR}/combined.log`,
            maxsize: keys.logs.maxLogFileSizeBytes,
        }),
        new transports.MongoDB({
            silent: false,                  // выключает логирование в монгу
            db: keys.mongo.mongoURL,
            collection: 'logs_data_flow',
            expireAfterSeconds: keys.mongo.timeToLiveSeconds,   // время хранения записей
        }),
        new transports.Console({ format: format.cli() })
    ]
});


export default LoggerInstance;