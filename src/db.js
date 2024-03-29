const { promisify } = require('util');
const redis = require("redis");
const redisearch = require('redis-redisearch');
redisearch(redis);
const redisearchclient = require('redisearchclient');

const { REDIS_OPTIONS, SEARCH_INDEX } = require('./config/db');

const client = redis.createClient(REDIS_OPTIONS);

client.on("error", function (error) {
    console.error(error);
});

const searchClient = redisearchclient(client, SEARCH_INDEX);

async function initializeSearchIndexIfNeeded() {
    const existsAsync = promisify(client.exists).bind(client);

    const createIndexAsync = promisify(searchClient.createIndex).bind(searchClient);
    const exists = await existsAsync('idx:' + SEARCH_INDEX);
    if (!exists) {
        try {
            await createIndexAsync([
                // TODO update fields.
                searchClient.fieldDefinition.text('name', true, { noStem: true }),
                searchClient.fieldDefinition.text('email', true, { noStem: true }),
                searchClient.fieldDefinition.text('birthDate', true, { noStem: true }),
                searchClient.fieldDefinition.tag('interests'),
                searchClient.fieldDefinition.tag('expertises'),
                searchClient.fieldDefinition.geo('location', true),
                // searchClient.fieldDefinition.numeric('maxDistKm', true)
            ]);
        } catch (error) {
            if (!(error instanceof redis.ReplyError && error.message === 'Index already exists')) {
                throw error;
            }
        }
    }
    return searchClient;
}

module.exports.client = client;
module.exports.searchClient = searchClient;
module.exports.getSearchClient = initializeSearchIndexIfNeeded;
