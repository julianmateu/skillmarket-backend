const HttpStatus = require('http-status-codes');

function catchAsync(handler) {
    return (...args) => handler(...args).catch(args[2]);
}

function notFound(req, res, next) {
    res.status(HttpStatus.NOT_FOUND).json({message: 'Not Found'});
}

function serverError(err, req, res, next) {
    if (!err.status) {
        console.error(err.stack);
    }

    res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: err.message || 'Internal Server Error' });
}

module.exports.catchAsync = catchAsync;
module.exports.notFound = notFound;
module.exports.serverError = serverError;
