const express = require('express');
const { promisify } = require('util');
const { client, searchClient } = require('./db');
const userController = require('./controller/UserController');
const User = require('./model/User');

const app = express();
const router = express.Router();



async function test() {
    await userController.addTestUsers();
    const users = await userController.retrieveUsers();
    console.log('users')
    console.log(users);

    const matches = await userController.findMatches(users.filter(u => u.name === 'Juan')[0].id, 500);
    console.log('matches');
    console.log(matches);

    const createResponse = await userController.createUser(new User('TestName', 123, '', '', '0,0'));
    console.log('createResponse');
    console.log(createResponse);

    const updateResponse = await userController.updateUser({id: createResponse.id, interests: 'art'});
    console.log('updateResponse');
    console.log(updateResponse);

    const user = await userController.findUserById(createResponse.id);
    console.log('user');
    console.log(user);

    const allUsers = await userController.retrieveUsers();
    for (const u of allUsers) {await userController.deleteUser(u.id)}

    const remainingUsers = await userController.retrieveUsers();
    console.log('All users deleted');
    console.log(remainingUsers);
}

// searchClient.dropIndex();

// TODO: make sure database client is ready.
promisify(setTimeout)(5000);
test();

router.get('/', (req, res) => {
    res.send('Hello world');
})

app.use('/', router);

const server = app.listen(3000, () => console.log('Server listening on port 3000...'));

module.exports = server;
