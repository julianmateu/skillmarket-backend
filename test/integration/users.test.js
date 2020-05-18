const request = require('supertest');
const HttpStatus = require('http-status-codes');
const {promisify} = require('util');
const _ = require('lodash');

const {searchClient} = require('../../src/db');
const userController = require('../../src/controller/UserController');

const dropIndexAsync = promisify(searchClient.dropIndex).bind(searchClient);

let server;

describe('/users', () => {
    beforeEach(async () => {
        jest.setTimeout(10000);
        server = await require('../../src/app')();
    });
    afterEach(async () => {
        if (server) {
            await server.close();
        }
        await dropIndexAsync();
    });

    const juan = {
        name: 'Juan',
        birthDate: '1992-01-01',
        email: 'juan@gmail.com',
        expertises: ['math', 'music'],
        interests: ['french'],
        location: {
            latitude: "0",
            longitude: "0",
        },
    };

    const password = 'Hg592OKf00$';

    describe('GET /', () => {
        it('should return all users', async () => {
            await userController.createUser({...juan, password, passwordConfirmation: password});

            const res = await request(server).get('/users');

            expect(res.status).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toMatchObject(juan);
        });
    });

    describe('GET /:id', () => {
        it('should return requested user', async () => {
            const { id } = await userController.createUser({...juan, password, passwordConfirmation: password});

            const res = await request(server).get(`/users/${id}`);

            expect(res.status).toBe(HttpStatus.OK);
            expect(res.body).toMatchObject(juan);
        });

        it('should return not found if requested user does not exist', async () => {
            const res = await request(server).get(`/users/1234`);
            expect(res.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('POST /', () => {
        it('should create requested user', async () => {
            const res = await request(server)
                .post('/users')
                .send({...juan, password, passwordConfirmation: password});

            expect(res.status).toBe(HttpStatus.OK);
            expect(res.body).toMatchObject(juan);
        });
    });
});
