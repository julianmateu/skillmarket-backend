const express = require('express');

const userController = require('../controller/UserController');

const router = express.Router();

// TODO validate requests
// TODO add response codes
// TODO add error handling

router.get('/', async (req, res) => {
    const users = await userController.retrieveUsers();
    return res.send(users);
});

router.get('/:id', async (req, res) => {
    const user = await userController.findUserById(req.params.id);
    return res.send(user);
});

router.post('/', async (req, res) => {
    const user = await userController.createUser(req.body);
    return res.send(user);
});

router.put('/:id', async (req, res) => {
    const user = await userController.updateUser({ ...req.body, id: req.params.id });
    return res.send(user);
});

router.delete('/:id', async (req, res) => {
   const user = await userController.deleteUser(req.params.id);
   return res.send(user);
});

module.exports = router;
