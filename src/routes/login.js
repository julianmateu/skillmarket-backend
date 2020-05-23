const express = require('express');

const {guest, auth} = require('../middleware/auth');
const {catchAsync} = require('../middleware/errors');
const {BadRequest, NotFound} = require('../errors');
const {logIn, logOut} = require('../auth');
const {loginSchema} = require('../validation/auth');
const {validate} = require('../validation/joi');

const userController = require('../controller/UserController');

const router = express.Router();

router.post('/login', guest, catchAsync(async (req, res) => {
    await validate(loginSchema, req.body);

    const {email, password} = req.body;

    let user = null;
    try {
        user = await userController.findUserByEmailWithPassword(email);
    } catch (err) {
        if (err instanceof NotFound) {
            user = null;
        }
    }

    if (!user || !(await userController.matchesPassword(user, password))) {
        throw new BadRequest('Incorrect email or password');
    }

    logIn(req, user.id);

    return res.send({message: 'OK'});
}));

router.post('/logout', auth, catchAsync(async (req, res) => {
    await logOut(req, res);

    return res.send({ message: 'OK' });
}));

module.exports = router;
