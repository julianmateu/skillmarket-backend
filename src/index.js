const userController = require('./controller/UserController');
const User = require('./model/User');
const createServer = require('./app');

process.on('unhandledRejection', up => {throw up});

// TODO: move to unit tests.
async function test() {
    await userController.addTestUsers();
    const users = await userController.retrieveUsers();
    console.log('users')
    console.log(users);

    const matches = await userController.findMatches(users.filter(u => u.name === 'Juan')[0].id, 500);
    console.log('matches');
    console.log(matches);

    const createResponse = await userController.createUser({
        name: 'TestName',
        birthDate: '2000-01-01',
        interests: ['none'],
        expertises: ['none'],
        password: 'TheSuperPassword1234',
        passwordConfirmation: 'TheSuperPassword1234',
        email: 'someemail@s.com',
        location: {
            longitude: '0',
            latitude: '0',
        },
    });
    console.log('createResponse');
    console.log(createResponse);

    const updateResponse = await userController.updateUser({id: createResponse.id, interests: ['art']});
    console.log('updateResponse');
    console.log(updateResponse);

    const user = await userController.findUserById(createResponse.id);
    console.log('user');
    console.log(user);

    const userByEmail = await userController.findUserByEmailWithPassword('someemail@s.com');
    console.log('someemail@s.com');
    console.log(userByEmail);

    // const allUsers = await userController.retrieveUsers();
    // for (const u of allUsers) {
    //     await userController.deleteUser(u.id)
    // }
    //
    // const remainingUsers = await userController.retrieveUsers();
    // console.log('All users deleted');
    // console.log(remainingUsers);
}

createServer().then(() => {
    // test();
    console.log('Server created...');
})
    .catch(console.error);

