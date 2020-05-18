const { SESSION_NAME } = require('./config/session');

function isLoggedIn(req) {
    const { userId } = req.session;
    if (!userId) {
        return false;
    }
    return !!userId;
}

function logIn(req, userId) {
    if (!userId) {
        throw Error('Null UserID');
    }
    req.session.userId = userId;
    req.session.createdAt = Date.now();
}

function logOut(req, res) {
    new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) {
                reject(err);
            }

            res.clearCookie(SESSION_NAME);
            resolve();
        });
    });
}

async function markAsVerified(user) {
    user.verifiedAt = new Date();
    await user.save();
}

async function resetPassword(user, password) {
    user.password = password;
    await user.save();
}

module.exports.isLoggedIn = isLoggedIn;
module.exports.logIn = logIn;
module.exports.logOut = logOut;
module.exports.markAsVerified = markAsVerified;
module.exports.resetPassword = resetPassword;
