const express = require('express');
const HttpStatus = require('http-status-codes');

const { guest, auth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errors');
const { validate } = require('../validation/joi');
const { registerSchema, updateSchema } = require('../validation/auth');
const userController = require('../controller/UserController');

const router = express.Router();


router.get('/profile', auth, catchAsync(async (req, res) => {
    const user = await userController.findUserById(req.session.userId);
    return res.send(user);
}));

router.put('/profile', auth, catchAsync(async (req, res) => {
    const user = await userController.updateUser({ ...req.body, id: req.session.userId });
    return res.send(user);
}));

router.get('/match/:maxKm', auth, catchAsync(async (req, res) => {
    const users = await userController.findMatches(req.session.userId, req.params.maxKm);
    return res.send(users);
}));

// TODO enable auth
router.get('/', auth, catchAsync(async (req, res) => {
    const users = await userController.retrieveUsers();
    return res.send(users);
}));

router.get('/:id', auth, catchAsync(async (req, res) => {
    const user = await userController.findUserById(req.params.id);
    if (!user) {
        return res.status(HttpStatus.NOT_FOUND).send();
    }
    return res.send(user);
}));

// TODO: enable these routes for admin users

// router.post('/', /*auth,*/ catchAsync(async (req, res) => {
//     const user = await userController.createUser(req.body);
//     return res.send(user);
// }));
//
// router.put('/:id', auth, catchAsync(async (req, res) => {
//     const user = await userController.updateUser({ ...req.body, id: req.params.id });
//     return res.send(user);
// }));
//
// router.delete('/:id', auth, catchAsync(async (req, res) => {
//    const user = await userController.deleteUser(req.params.id);
//    return res.send(user);
// }));

module.exports = router;
