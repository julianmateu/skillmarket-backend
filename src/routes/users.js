const express = require('express');
const HttpStatus = require('http-status-codes');

const { guest, auth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errors');
const { validate } = require('../validation/joi');
const { registerSchema, updateSchema } = require('../validation/auth');
const userController = require('../controller/UserController');

const router = express.Router();

// TODO enable auth

router.get('/', /*auth,*/ catchAsync(async (req, res) => {
    const users = await userController.retrieveUsers();
    return res.send(users);
}));

router.get('/:id', /*auth,*/ catchAsync(async (req, res) => {
    const user = await userController.findUserById(req.params.id);
    if (!user) {
        return res.status(HttpStatus.NOT_FOUND).send();
    }
    return res.send(user);
}));

router.post('/', /*auth,*/ catchAsync(async (req, res) => {
    await validate(registerSchema, req.body);
    const user = await userController.createUser(req.body);
    return res.send(user);
}));

router.put('/:id', auth, catchAsync(async (req, res) => {
    const user = await userController.updateUser({ ...req.body, id: req.params.id });
    return res.send(user);
}));

router.delete('/:id', auth, catchAsync(async (req, res) => {
   const user = await userController.deleteUser(req.params.id);
   return res.send(user);
}));

module.exports = router;
