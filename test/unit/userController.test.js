const _ = require('lodash');
const {v4: uuidv4} = require('uuid');

const {NotFound} = require('../../src/errors');

const userController = require('../../src/controller/UserController');

jest.mock('../../src/db', () => {
    return {
        searchClient: {
            name: 'MockClient',
            add: (id, doc, passedOptsOrCb, passedCb) => {
                let cb = () => {
                };
                let opts = {};
                if (typeof passedOptsOrCb === 'function') {                       // passed a function in penultimate argument then there is no opts
                    cb = passedOptsOrCb;
                } else if (typeof passedCb === 'function') {                   // If the final argument is a function then we know there is a options object in the penultimate
                    opts = passedOptsOrCb;
                    cb = passedCb;
                } else if (passedOptsOrCb) {                                      // If neither the penulitimate or ultimate argument is a function then we know the penultimate is options
                    opts = passedOptsOrCb;
                }
                cb(null, 'OK');
            },
            getDoc: (id, cb) => {
                if (id === 'f49be43f-e8a0-4b25-9609-31a0059684b2') {
                    cb(null, {doc: {}});
                }
                cb(null, {
                    doc: {
                        id,
                        name: "Juan",
                        email: "juan@juan.com",
                        birthDate: "1990-01-01",
                        expertises: "math, music",
                        interests: "french",
                        location: "0,0",
                    }
                });
            },
            delDoc: (id, cb) => {
                console.log(`mock deleting ${id}`);
                cb(null, 'OK');
            },
            search: (query, cb) => {
                if (query === '@email:juan/@/juan.com') {
                    cb(null, {results: []});
                }
                cb(null, {
                    results: [
                        {
                            doc: {
                                name: 'Juan',
                                birthDate: '1990-01-01',
                                email: 'juan@juan.com',
                                password: '$2a$12$wGA/vba9hnLnakCgnSZXU.yBwIQpNMDFufd4k8uBOjazg6W1AkAEe',
                                expertises: 'math, music',
                                interests: 'french',
                                location: '0,0',
                            },
                            docId: '235a95e1-07b6-4f15-b687-1e9f062faa01',
                        }
                    ],
                });
            },
        }
    }
});

describe('userController', () => {

    const juanInput = {
        name: "Juan",
        email: "juan@juan.com",
        birthDate: "1990-01-01",
        expertises: [
            "math",
            "music",
        ],
        interests: [
            "french",
        ],
        password: "ThePassword1234",
        passwordConfirmation: "ThePassword1234",
        location: {
            latitude: "0",
            longitude: "0",
        }
    }

    const juanOutput = _.pick(juanInput, [
        'name',
        'email',
        'birthDate',
        'expertises',
        'interests',
        'location',
    ]);

    describe('createUser', () => {
        it('should create User', async () => {

            const user = await userController.createUser(juanInput);

            expect(user).toMatchObject(juanOutput); // toMatchObject ignores extra fields like the id.
            expect(user).toHaveProperty('id');
            expect(user).not.toHaveProperty('password');
            expect(user).not.toHaveProperty('passwordConfirmation');
        });
    });

    describe('findUserById', () => {
        it('should retrieve User', async () => {

            const user = await userController.findUserById(uuidv4());

            expect(user).toMatchObject(juanOutput);
            expect(user).toHaveProperty('id');
            expect(user).not.toHaveProperty('password');
            expect(user).not.toHaveProperty('passwordConfirmation');
        });

        it('should throw NotFound for inexistent user', async () => {
            await expect(async () => {
                await userController.findUserById('f49be43f-e8a0-4b25-9609-31a0059684b2');
            }).rejects.toThrow(NotFound);
        });
    });

    describe('findUserByEmailWithPassword', () => {
        it('should retrieve User', async () => {
            const user = await userController.findUserByEmailWithPassword('asdf@asdf.com');

            expect(user).toMatchObject(juanOutput);
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('password');
            expect(user.password).toMatch('$2a$12$wGA/vba9hnLnakCgnSZXU.yBwIQpNMDFufd4k8uBOjazg6W1AkAEe');
        });

        it('should throw NotFound for inexistent user', async () => {
            await expect(async () => {
                await userController.findUserByEmailWithPassword('juan@juan.com');
            }).rejects.toThrow(NotFound);
        });
    });

    describe('updateUser', () => {
        it('should update User', async () => {

            const oldUser = await userController.findUserById(uuidv4());

            const updatedUser = await userController.updateUser({name: "newName", id: oldUser.id});

            expect(updatedUser).toMatchObject({...oldUser, name: "newName"});
            expect(updatedUser).toHaveProperty('id');
            expect(updatedUser).not.toHaveProperty('password');
            expect(updatedUser).not.toHaveProperty('passwordConfirmation');
        });
    });
});
