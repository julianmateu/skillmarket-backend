const {
    CORS_ORIGIN_HOST = 'http://localhost:8080'
} = process.env;

const CORS_OPTIONS = {
    origin: CORS_ORIGIN_HOST,
    methods:['GET','POST','PUT'],
    credentials: true,
};

module.exports.CORS_OPTIONS = CORS_OPTIONS;
