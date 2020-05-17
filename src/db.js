const { promisify } = require('util');
const redis = require("redis");
const redisearch = require('redis-redisearch');
redisearch(redis);
const redisearchclient = require('redisearchclient');

const client = redis.createClient();

client.on("error", function (error) {
    console.error(error);
});

const searchIndex = 'testSearchIndex2';
searchClient = redisearchclient(client, searchIndex);

const existsAsync = promisify(client.exists).bind(client);

async function initializeSearchIndexIfNeeded() {
    const exists = await existsAsync('idx:' + searchIndex);
    if (!exists) {
        searchClient.createIndex([
            searchClient.fieldDefinition.text('name', true, {noStem: true}),
            searchClient.fieldDefinition.numeric('age', true),
            searchClient.fieldDefinition.tag('interests'),
            searchClient.fieldDefinition.tag('expertises'),
            searchClient.fieldDefinition.geo('location', true),
            // searchClient.fieldDefinition.numeric('maxDistKm', true)
        ], (err) => {
            if (!exists) {
                if (err) throw err;
            }
        });
    }
}

initializeSearchIndexIfNeeded();

module.exports.client = client;
module.exports.searchClient = searchClient;
