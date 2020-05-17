const express = require('express');
const { promisify } = require('util');
require('./db');
const userController = require('./controller/UserController');
const User = require('./model/User');

const app = express();
const router = express.Router();

promisify(setTimeout)(3000);

// userController.addUsers();

// userController.findMatches('47dfcf6a-df3b-46d5-a1a7-7158ce1ea525', 500).then(console.log);
userController.findMatches('4302cef4-8e5c-47b8-9607-873521a82a4f', 1).then(console.log);

// userController.addUser(new User('TestName', 123, '', '', '0,0'));

// userController.getUsers().then(console.log);

// userController.getUserById('f092082f-ca39-4d1b-b2f5-afa04e00824f').then(console.log);
// userController.deleteUser('f092082f-ca39-4d1b-b2f5-afa04e00824f').then(console.log);

router.get('/', (req, res) => {
    res.send('Hello world');
})

app.use('/', router);

const server = app.listen(3000, () => console.log('Server listening on port 3000...'));

module.exports = server;
