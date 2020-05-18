const { IN_PROD, APP_HOSTNAME } = require('./app');

const {
    SMTP_HOST = 'smtp.mailtrap.io',
    SMTP_PORT = 25,
    SMTP_USERNAME = 'dffdc324953b20',
    SMTP_PASSWORD = '38e6062046547b',
} = process.env;

const SMTP_OPTIONS = {
    host: SMTP_HOST,
    port: +SMTP_PORT,
    secure: IN_PROD,
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
    },
};

const MAIL_FROM = `noreply@${APP_HOSTNAME}`;

module.exports.SMTP_OPTIONS = SMTP_OPTIONS;
module.exports.MAIL_FROM = MAIL_FROM;
