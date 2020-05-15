const express = require('express');
const redis = require("redis");

const app = express();

const router = express.Router();

const client = redis.createClient();

client.on("error", function(error) {
    console.error(error);
});


client.set("key", "value", redis.print);
client.get("key", redis.print);

router.get('/', (req, res) => {
    res.send('Hello world');
})

app.use('/', router);

const server = app.listen(3000, () => console.log('Server listening on port 3000...'));

module.exports = server;

