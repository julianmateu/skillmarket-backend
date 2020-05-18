const nodemailer = require('nodemailer');
const { SMTP_OPTIONS, MAIL_FROM } = require('./config/mail');

const transporter = nodemailer.createTransport(SMTP_OPTIONS);

function sendMail(options) {
    transporter.sendMail({
        ...options,
        from: MAIL_FROM
    });
}

module.exports.sendMail = sendMail;
