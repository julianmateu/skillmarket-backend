const { IN_TEST } = require('./app');

const {
    REDIS_PORT = 6379,
    REDIS_HOST = 'localhost',
    REDIS_PASSWORD = null,
} = process.env;

const REDIS_OPTIONS = {
    port: REDIS_PORT,
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
};

for (const key in REDIS_OPTIONS) {
    if (!REDIS_OPTIONS[key]) {
        delete REDIS_OPTIONS[key];
    }
}

const SEARCH_INDEX = IN_TEST ? 'testSearchIndex' : 'searchIndex';

module.exports.REDIS_OPTIONS = REDIS_OPTIONS;
module.exports.SEARCH_INDEX = SEARCH_INDEX;
