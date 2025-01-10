const winston = require('winston');
const { combine, timestamp, printf, colorize, align, json } = winston.format;


const errorFilter = winston.format((info: any) => {
    return info.level === 'error' ? info : false;
});

const infoFilter = winston.format((info: any) => {
    return info.level === 'info' ? info : false;
});

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    level: 'info',
    format: combine(
        colorize({ all: true }),
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        align(),
        printf((info: any) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'app-info.log',
            level: 'info',
            format: combine(infoFilter(), timestamp(), json()),
        }),
        new winston.transports.File({
            filename: '/logs/app-error.log',
            level: 'error',
            format: combine(errorFilter(), timestamp(), json()),
        }),
    ],
});

module.exports = logger