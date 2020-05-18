const JoiDate = require('@hapi/joi-date');
const Joi = require('@hapi/joi').extend(JoiDate);

const {
    BCRYPT_MAX_BYTES, EMAIL_VERIFICATION_TOKEN_BYTES, EMAIL_VERIFICATION_SIGNATURE_BYTES, PASSWORD_RESET_BYTES
} = require('../config/auth');

const id = Joi.string().guid().required();

const email = Joi.string().email().min(8).max(254).lowercase().trim().required();

const name = Joi.string().min(3).max(128).trim().required();

const password = Joi.string().min(8).max(BCRYPT_MAX_BYTES, 'utf8')
    .regex(/^(?=.*?[\p{Lu}])(?=.*?[\p{Ll}])(?=.*?\d).*$/u)
    .message('"{#label}" must contain one uppercase letter, one lowercase letter, and one digit')
    .required();

const passwordConfirmation = Joi.valid(Joi.ref('password')).required();

const birthDate = Joi.date().format('YYYY-MM-DD').raw().required();

const interests = Joi.array().items(Joi.string()).required();

const expertises = Joi.array().items(Joi.string()).required();

const latitude = Joi.number().min(-90).max(90).required();

const longitude = Joi.number().min(-180).max(180).required();

const locationSchema = Joi.object({
    latitude,
    longitude,
});

const updateSchema = Joi.object({
    id,
    email,
    name,
    birthDate,
    expertises,
    interests,
    location: locationSchema,
});

const registerSchema = Joi.object({
    email,
    name,
    birthDate,
    expertises,
    interests,
    location: locationSchema,
    password,
    passwordConfirmation,
});

const loginSchema = Joi.object({
    email,
    password,
});

const verifyEmailSchema = Joi.object({
    id,
    token: Joi.string().length(EMAIL_VERIFICATION_TOKEN_BYTES).required(),
    expires: Joi.date().timestamp().required(),
    signature: Joi.string().length(EMAIL_VERIFICATION_SIGNATURE_BYTES).required(),
});

const resendEmailSchema = Joi.object({
    email,
});

const forgotPasswordSchema = Joi.object({
    email,
});

const resetPasswordSchema = Joi.object({
    query: Joi.object({
        id,
        token: Joi.string().length(PASSWORD_RESET_BYTES * 2).required(),
    }),
    body: Joi.object({
        password,
        passwordConfirmation,
    }),
});

module.exports.updateSchema = updateSchema;
module.exports.registerSchema = registerSchema;
module.exports.loginSchema = loginSchema;
module.exports.verifyEmailSchema = verifyEmailSchema;
module.exports.resendEmailSchema = resendEmailSchema;
module.exports.forgotPasswordSchema = forgotPasswordSchema;
module.exports.resetPasswordSchema = resetPasswordSchema;

