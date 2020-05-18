const {
    NODE_ENV = 'development',

    APP_PORT = 3000,
    APP_HOSTNAME = 'localhost',
    APP_PROTOCOL = 'http',

    APP_SECRET = '4d2ca599b4189f74a771f44b8a8d06f572208b5649f5ae216f8e94612a267ff0',
} = process.env;

const APP_ORIGIN = `${APP_PROTOCOL}://${APP_HOSTNAME}:${APP_PORT}`;

const IN_PROD = NODE_ENV === 'production';
const IN_TEST = NODE_ENV === 'test';

module.exports.IN_PROD = IN_PROD;
module.exports.IN_TEST = IN_TEST;
module.exports.APP_PORT = APP_PORT;
