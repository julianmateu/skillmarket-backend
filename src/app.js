const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors')
const RedisStore = require('connect-redis')(session);

const {SESSION_OPTIONS} = require('./config/session');
const {CORS_OPTIONS} = require('./config/cors');
const {APP_PORT} = require('./config/app');
const {client, getSearchClient} = require('./db');
const users = require('./routes/users');
const login = require('./routes/login');
const register = require('./routes/register');
const {notFound, serverError} = require('./middleware/errors');


function createApp(store) {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use(morgan('dev'));

    app.use(cors(CORS_OPTIONS));

    app.use(session({...SESSION_OPTIONS, store}));

    app.use('/users', users);
    app.use('/', login);
    app.use('/register', register);

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
