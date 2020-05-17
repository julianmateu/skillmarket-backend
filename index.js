const express = require('express');
const {promisify} = require('util');
const {v4: uuidv4} = require('uuid');
const redis = require("redis");
const redisearch = require('redis-redisearch');
redisearch(redis);
const redisearchclient = require('redisearchclient');

const app = express();

const router = express.Router();

const client = redis.createClient();

client.on("error", function (error) {
    console.error(error);
});

const searchIndex = 'testSearchIndex2';
searchClient = redisearchclient(client, searchIndex);

const existsAsync = promisify(client.exists).bind(client);


existsAsync('idx:' + searchIndex)
    .then((exists) => {
        if (!exists) {
            searchClient.createIndex([
                searchClient.fieldDefinition.text('name', true, {noStem: true}),
                searchClient.fieldDefinition.numeric('age', true),
                searchClient.fieldDefinition.tag('interests'),
                searchClient.fieldDefinition.tag('expertises'),
                searchClient.fieldDefinition.geo('location', true),
                // searchClient.fieldDefinition.numeric('maxDistKm', true)
            ], (err) => {
                if (err) throw err;
            });
        }
    })
    .catch(console.error);


function addUser(user) {
    searchClient.add(uuidv4(), user, (err) => {
        if (err) throw err;
    });
}

function addUsers() {
    addUser({
        name: 'Juan',
        age: 24,
        interests: 'math, music',
        expertises: 'french',
        location: '-0.017316,51.508415'
    });

    addUser({
        name: 'Pedro',
        age: 33,
        interests: 'math',
        expertises: 'music',
        location: '-0.020798,51.499090'
    });

    addUser({
        name: 'Pepe',
        age: 45,
        interests: 'french',
        expertises: 'math',
        location: '-0.189527,51.528193'
    });

    addUser({
        name: 'Marta',
        age: 21,
        interests: 'french',
        location: '2.407216,48.858021'
    });
}

const getDocAsync = promisify(searchClient.getDoc).bind(searchClient);
const searchAsync = promisify(searchClient.search).bind(searchClient);

async function findMatches(userId, maxDistKm) {
    const {doc: user} = await getDocAsync(userId);
    console.log('getDoc = ' + JSON.stringify(user));
    let query = '';
    const interests = user.interests ? user.interests.split(',').map((item) => item.trim()) : [];
    const expertises = user.expertises ? user.expertises.split(',').map((item) => item.trim()) : [];
    const wantedInterests = interests.concat(expertises);
    const wantedExpertises = interests;
    if (wantedInterests && wantedInterests.length) {
        query += `@interests:{${wantedInterests.join('|')}} `;
    }
    if (wantedExpertises && wantedExpertises.length) {
        query += `@expertises:{${wantedExpertises.join('|')}} `;
    }
    const location = user.location.split(',');
    query += `@location:[${location[0]} ${location[1]} ${maxDistKm} km] `;
    console.log(query);

    const results = await searchAsync(query);
    console.log(results.results);
    return results.results;
}

promisify(setTimeout)(3000);

// addUsers();
findMatches('4191ba2a-206a-4279-8128-2cb8f003dd5b', 500);

router.get('/', (req, res) => {
    res.send('Hello world');
})

app.use('/', router);

const server = app.listen(3000, () => console.log('Server listening on port 3000...'));

module.exports = server;
