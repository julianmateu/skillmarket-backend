const { isLoggedIn, logOut } = require('../auth');
const { BadRequest, Unauthorized } = require('../errors');
const { SESSION_ABSOLUTE_TIMEOUT } = require('../config/session');
const { catchAsync } = require('./errors');

function guest(req, res, next) {
    if (isLoggedIn(req)) {
        return next(new BadRequest('You are already logged in'));
    }

    next();
}

function auth(req, res, next) {
    if (!isLoggedIn(req)) {
        return next(new Unauthorized('You must be logged in'));
    }

    next();
}

function active(req, res, next) {
    catchAsync(async (req, res, next) => {
            if (isLoggedIn(req)) {
                const now = Date.now();
                const { createdAt } = req.session;

                if (now > createdAt + SESSION_ABSOLUTE_TIMEOUT) {
                    await logOut(req, res);

                    return next(new Unauthorized('Session expired'));
                }
            }

            next();
        }
    )(req, res, next);
}

module.exports.guest = guest;
module.exports.auth = auth;
module.exports.active = active;
