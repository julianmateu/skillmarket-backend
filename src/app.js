const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const {SESSION_OPTIONS} = require('./config/session');
const {APP_PORT} = require('./config/app');
const {client, getSearchClient} = require('./db');
const users = require('./routes/users');
const {notFound, serverError} = require('./middleware/errors');


function createApp(store) {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use(session({...SESSION_OPTIONS, store}));

    app.use('/users', users);

    app.use(notFound);

    app.use(serverError);

    return app;
}

async function createServer() {
    const store = new RedisStore({client});
    const app = createApp(store);

    await getSearchClient();
    console.log('Connected to redis...');
    const server = app.listen(APP_PORT, () => {
        console.log(`Server listening on port ${APP_PORT}...`);
    });
    return server;
}

module.exports = createServer;
