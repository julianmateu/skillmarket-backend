const express = require('express');
const redis = require("redis");
const redisearch = require('redis-redisearch');
redisearch(redis);
const redisearchclient = require('redisearchclient');

const app = express();

const router = express.Router();

const client = redis.createClient();

client.on("error", function(error) {
    console.error(error);
});
searchClient = redisearchclient(client, 'testSearchIndex');

searchClient.createIndex([
    searchClient.fieldDefinition.text('name', true, {noStem: true}),
    searchClient.fieldDefinition.numeric('age', true),
    searchClient.fieldDefinition.tag('interests', true),
    searchClient.fieldDefinition.tag('expertises', true),
    searchClient.fieldDefinition.geo('location', true)
],
    function(err) {
        if (err) {throw err;}
        searchClient.batch()
            .rediSearch.add(1, {
                name: 'Juan',
                age: 24,
                interests: 'math, music',
                expertises: 'french',
                location: '-0.017316,51.508415'
            })
            .rediSearch.add(2, {
                name: 'Pedro',
                age: 33,
                interests: 'math',
                expertises: 'music',
                location: '-0.020798,51.499090'
            })
            .rediSearch.add(3, {
                name: 'Pepe',
                age: 45,
                interests: 'french',
                expertises: 'math',
                location: '-0.189527,51.528193'
            })
            .rediSearch.add(4, {
                name: 'Marta',
                age: 21,
                interests: 'french',
                location: '2.407216,48.858021'
            })
            .rediSearch.search('@interests:{french|math|music} @expertises:{math|music} @location:[-0.017316 51.508415 50 km]')
            .rediSearch.exec(function(err, results) {
                if (err) {throw err;}
                console.log(results);
                console.log(JSON.stringify(results[4], null, 2));
        })
    });

router.get('/', (req, res) => {
    res.send('Hello world');
})

app.use('/', router);

const server = app.listen(3000, () => console.log('Server listening on port 3000...'));

module.exports = server;
