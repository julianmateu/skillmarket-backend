const express = require('express');

const users = require('./routes/users');

function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/users', users);

    return app;
}

module.exports = createApp;
