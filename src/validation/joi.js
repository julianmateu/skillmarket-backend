const { BadRequest } = require('../errors');

async function validate(schema, payload) {
    try {
        await schema.validateAsync(payload, { abortEarly: false })
    } catch (e) {
        throw new BadRequest(e)
    }
}

module.exports.validate = validate;
