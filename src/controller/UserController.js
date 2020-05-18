const {promisify} = require('util');
const {v4: uuidv4} = require('uuid');
const {hash} = require('bcryptjs');

const { BCRYPT_WORK_FACTOR } = require('../config/auth');
const { searchClient } = require('../db');
const User = require('../model/User');
const {  } = require('../errors');

const addAsync = promisify(searchClient.add).bind(searchClient);
const getDocAsync = promisify(searchClient.getDoc).bind(searchClient);
const searchAsync = promisify(searchClient.search).bind(searchClient);
const delAsync = promisify(searchClient.delDoc).bind(searchClient);

async function createUser(user) {
    const userToAdd = await _getUserToAdd(user);
    const id = uuidv4();
    const response = await addAsync(id, userToAdd);
    if (response !== 'OK') {
        throw Error(response);
    }
    const result = _processDBUser({doc: userToAdd, docId: id});
    return result;
}

async function findUserById(id) {
    const dbUser = await getDocAsync(id);
    return Object.keys(dbUser.doc).length === 0 ? null : _processDBUser({...dbUser, docId: id});
}

async function retrieveUsers() {
    const result = await searchAsync('*');
    return result.results.map(_processDBUser);
}

async function updateUser(user) {
    const previousUser = await findUserById(user.id);

    if (!previousUser) {
        throw Error('User does not exist');
    }

    const userToAdd = await _getUserToAdd({...previousUser, ...user});

    const response = await addAsync(user.id, userToAdd, {extras: ['REPLACE', 'PARTIAL', 'NOCREATE']});
    if (response !== 'OK') {
        throw Error(response);
    }
    return _processDBUser({ doc: userToAdd, docId: user.id });
}

async function deleteUser(id) {
    const user = await findUserById(id);
    if (!user) return null;
    await delAsync(id);
    return user;
}

async function findMatches(userId, maxDistKm) {
    const user = await findUserById(userId);

    if (!user) {
        throw Error('User does not exist');
    }

    const query = _buildQueryForUser(user, maxDistKm);

    const results = await searchAsync(query);

    return results.results.map(_processDBUser);
}

// TODO: move to unit tests
async function addTestUsers() {
    await createUser({
        name: 'Juan',
        birthDate: '1992-12-03',
        interests: ['math', 'music'],
        expertises: ['french'],
        location: {
            longitude: '-0.017316',
            latitude: '51.508415',
        },
        password: '1234',
        email: 'juan@juan.com',
    });

    await createUser({
        name: 'Pedro',
        birthDate: '1984-01-23',
        interests: ['math'],
        expertises: ['music'],
        location: {
            longitude: '-0.020798',
            latitude: '51.499090',
        },
        password: '12039480jfpijwe',
        email: 'pedro@pedro.com',
    });

    await createUser({
        name: 'Pepe',
        birthDate: '1960-04-05',
        interests: ['french'],
        expertises: ['math'],
        location: {
            longitude: '-0.189527',
            latitude: '51.528193',
        },
        password: 'j-24JF0923',
        email: 'pepe@pepe.com',
    });

    await createUser({
        name: 'Marta',
        birthDate: '2000-10-10',
        interests: ['french'],
        expertises: [''],
        location: {
            longitude: '2.407216',
            latitude: '48.858021',
        },
        password: 'password',
        email: 'martita@s.com',
    });
}

function _processDBUser(dbUser) {
    const userToGet = (({
                            name,
                            birthDate,
                            email,
                            interests,
                            expertises,
                            location,
                        }) => ({
        name,
        birthDate,
        email,
        interests,
        expertises,
        location,
    }))(dbUser.doc);
    const result =  { ...JSON.parse(JSON.stringify(userToGet)), id: dbUser.docId };
    result.interests = result.interests.split(', ');
    result.expertises = result.expertises.split(', ');
    result.location = _getLocationFromString(result.location);

    return result;
}

function _getLocationFromString(s) {
    const [ longitude, latitude ] = s.split(',');
    return { longitude, latitude };
}


async function _getUserToAdd(user) {
    var userToAdd = (({
                          name,
                          birthDate,
                          email,
                          password,
                          interests,
                          expertises,
                          location,
                      }) => ({
        name,
        birthDate,
        email,
        password,
        interests,
        expertises,
        location,
    }))(user);

    userToAdd.password = await hash(userToAdd.password, BCRYPT_WORK_FACTOR);
    userToAdd.birthDate = new Date(userToAdd.birthDate).toISOString().split('T')[0];
    userToAdd.interests = userToAdd.interests.join(', ');
    userToAdd.expertises = userToAdd.expertises.join(', ');
    userToAdd.location = `${userToAdd.location.longitude},${userToAdd.location.latitude}`;

    return userToAdd;
}

function _buildQueryForUser(user, maxDistKm) {
    const interests = user.interests ? user.interests.map((item) => item.trim()) : [];
    const expertises = user.expertises ? user.expertises.map((item) => item.trim()) : [];
    const location = user.location;

    const wantedInterests = interests.concat(expertises);
    const wantedExpertises = interests;

    let query = '';

    if (wantedInterests && wantedInterests.length) {
        query += `@interests:{${wantedInterests.join('|')}} `;
    }

    if (wantedExpertises && wantedExpertises.length) {
        query += `@expertises:{${wantedExpertises.join('|')}} `;
    }

    query += `@location:[${location.longitude} ${location.latitude} ${maxDistKm} km] `;

    return query;
}

module.exports.createUser = createUser;
module.exports.retrieveUsers = retrieveUsers;
module.exports.findUserById = findUserById;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.addTestUsers = addTestUsers;
module.exports.findMatches = findMatches;
