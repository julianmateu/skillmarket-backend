
const express = require('express');

const { guest } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errors');
const { registerSchema } = require('../validation/auth');
const { validate } = require('../validation/joi');
const { BadRequest } = require('../errors');
const { logIn } = require("../auth");
const { sendMail } = require('../mail');
const { userController } = require('../controller/UserController');

const router = express.Router();

router.post('/', guest, catchAsync(async (req, res) => {
    await validate(registerSchema, req.body);

    const user = await userController.createUser(req.body);

    // const { email, name, password } = req.body;
    //
    // if (found) {
    //     throw new BadRequest('Invalid email');
    // }
    //
    // const user = await User.create({
    //     email,
    //     name,
    //     password,
    // });

    logIn(req, user.id);

    // const link = user.verificationUrl();

    // await sendMail({
    //     to: email,
    //     subject: 'Verify your email address',
    //     text: link
    // });

    return res.send({ message: 'OK' });
}));

module.exports = router;
