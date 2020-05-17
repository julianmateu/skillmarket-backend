const { getSearchClient } = require('./db');
const userController = require('./controller/UserController');
const User = require('./model/User');

const app = require('./app')();

getSearchClient().then(() => console.log('Connected to redis...'));

// TODO: move to unit tests.
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

const { PORT = 3000 } = process.env;
const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));

module.exports = server;
