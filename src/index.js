const createServer = require('./app');

process.on('unhandledRejection', up => {throw up});

createServer().then(() => {
    console.log('Server created...');
})
    .catch(console.error);

