const request = require('supertest');
const HttpStatus = require('http-status-codes');
const {promisify} = require('util');
const {v4: uuidv4} = require('uuid');
const _ = require('lodash');

const {searchClient} = require('../../src/db');
const userController = require('../../src/controller/UserController');

const dropIndexAsync = promisify(searchClient.dropIndex).bind(searchClient);

let server;

describe('login', () => {
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

    const email = 'juan@gmail.com';

    const juan = {
        name: 'Juan',
        birthDate: '1992-01-01',
        email,
        expertises: ['math', 'music'],
        interests: ['french'],
        location: {
            latitude: "0",
            longitude: "0",
        },
    };

    const password = 'Hg592OKf00$';

    describe('POST /login', () => {
        it('should authenticate the user', async () => {
            const user = await userController.createUser({...juan, password, passwordConfirmation: password});

            const res = await request(server)
                .post('/login')
                .send({email, password});

            expect(res.status).toBe(HttpStatus.OK);
            expect(res.headers).toHaveProperty('set-cookie');
            expect(res.headers['set-cookie'][0]).toEqual(expect.stringMatching(/sid=.+;/));
        });

        it('should fail if user does not exist', async () => {
            const res = await request(server)
                .post('/login')
                .send({email, password});

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
            expect(res.headers).not.toHaveProperty('set-cookie');
        });

        it('should fail if password is wrong', async () => {
            const user = await userController.createUser({...juan, password, passwordConfirmation: password});

            const res = await request(server)
                .post('/login')
                .send({email, password: password + "12" });

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
            expect(res.headers).not.toHaveProperty('set-cookie');
        });
    });

    describe('POST /logout', () => {
        it('should fail if the user is not logged in', async () => {
            const res = await request(server)
                .post('/logout')
                .send();

            expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it('it should clear the user cookie', async () => {
            await userController.createUser({...juan, password, passwordConfirmation: password});

            const res1 = await request(server)
                .post('/login')
                .send({email, password});

            const cookie = res1.headers['set-cookie'][0];

            const res = await request(server)
                .post('/logout')
                .set('Cookie', cookie)
                .send();

            expect(res.status).toBe(HttpStatus.OK);
            expect(res.headers).toHaveProperty('set-cookie');
            expect(res.headers['set-cookie'][0]).toEqual(expect.stringMatching(/sid=;/));
        });
    });
});
