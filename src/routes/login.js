const express = require('express');

const { guest, auth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errors');
const { BadRequest } = require('../errors');
const { logIn, logOut } = require('../auth');
const { loginSchema } = require('../validation/auth');
const { validate } = require('../validation/joi');

const router = express.Router();

router.post('/login', guest, catchAsync(async (req, res) => {
    await validate(loginSchema, req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchesPassword(password))) {
        throw new BadRequest('Incorrect email or password');
    }

    logIn(req, user.id);

    res.json({ message: 'OK' });
}));

router.post('/logout', auth, catchAsync(async (req, res) => {
    await logOut(req, res);

    res.json({ message: 'OK' });
}));

module.exports = router;
