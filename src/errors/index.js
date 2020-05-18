const HttpStatus = require('http-status-codes');

class HttpError extends Error {
    status;

    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class BadRequest extends HttpError {
    constructor (message='Bad Request') {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

class Unauthorized extends HttpError {
    constructor (message='Unauthorized') {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

module.exports.BadRequest = BadRequest;
module.exports.Unauthorized = Unauthorized;
