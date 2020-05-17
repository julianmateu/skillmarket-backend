const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const { searchClient } = require('../db');
const User = require('../model/User');

const addAsync = promisify(searchClient.add).bind(searchClient);
const getDocAsync = promisify(searchClient.getDoc).bind(searchClient);
const searchAsync = promisify(searchClient.search).bind(searchClient);
const delAsync = promisify(searchClient.delDoc).bind(searchClient);

async function createUser(user) {
    const userToAdd = _getUserToAdd(user);
    const id = uuidv4();
    const response = await addAsync(id, userToAdd);
    if (response !== 'OK') {
        throw Error(response);
    }
    return { ...userToAdd, id };
}

async function findUserById(id) {
    const dbUser = await getDocAsync(id)
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

    const userToAdd = _getUserToAdd({...previousUser, ...user});

    const response =  await addAsync(user.id, userToAdd, {extras: ['REPLACE', 'PARTIAL', 'NOCREATE']});
    if (response !== 'OK') {
        throw Error(response);
    }
    return { ...userToAdd, id: user.id };
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

    return results.results;
}

// TODO: move to unit tests
function addTestUsers() {
    createUser(new User(
        'Juan',
        24,
        'math, music',
        'french',
        '-0.017316,51.508415'
    ));

    createUser({
        name: 'Pedro',
        age: 33,
        interests: 'math',
        expertises: 'music',
        location: '-0.020798,51.499090'
    });

    createUser({
        name: 'Pepe',
        age: 45,
        interests: 'french',
        expertises: 'math',
        location: '-0.189527,51.528193'
    });

    createUser({
        name: 'Marta',
        age: 21,
        interests: 'french',
        expertises: '',
        location: '2.407216,48.858021'
    });
}

function _processDBUser(dbUser) {
    return { ...JSON.parse(JSON.stringify(dbUser.doc)), id: dbUser.docId };
}


function _getUserToAdd(user) {
    return (({name, age, interests, expertises, location}) => ({name, age, interests, expertises, location}))(user);
}

function _buildQueryForUser(user, maxDistKm) {
    const interests = user.interests ? user.interests.split(',').map((item) => item.trim()) : [];
    const expertises = user.expertises ? user.expertises.split(',').map((item) => item.trim()) : [];
    const location = user.location.split(',');

    const wantedInterests = interests.concat(expertises);
    const wantedExpertises = interests;

    let query = '';

    if (wantedInterests && wantedInterests.length) {
        query += `@interests:{${wantedInterests.join('|')}} `;
    }

    if (wantedExpertises && wantedExpertises.length) {
        query += `@expertises:{${wantedExpertises.join('|')}} `;
    }

    query += `@location:[${location[0]} ${location[1]} ${maxDistKm} km] `;

    return query;
}

module.exports.createUser = createUser;
module.exports.retrieveUsers = retrieveUsers;
module.exports.findUserById = findUserById;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.addTestUsers = addTestUsers;
module.exports.findMatches = findMatches;
