const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const { client, searchClient } = require('../db');
const User = require('../model/User');

const getDocAsync = promisify(searchClient.getDoc).bind(searchClient);
const searchAsync = promisify(searchClient.search).bind(searchClient);
const delAsync = promisify(searchClient.del).bind(searchClient);

function processDBUser(dbUser) {
    return { ...JSON.parse(JSON.stringify(dbUser.doc)), id: dbUser.docId };
}

async function getUsers() {
    const result = await searchAsync('*');
    return result.results.map(processDBUser);
}

async function getUserById(id) {
    const dbUser = await getDocAsync(id)
    return Object.keys(dbUser.doc).length === 0 ? null : processDBUser({...dbUser, docId: id});
}

async function addUser(user) {
    const userToAdd =
        (({name, age, interests, expertises, location}) => ({name, age, interests, expertises, location}))(user);
    return searchClient.add(uuidv4(), userToAdd);
}

async function deleteUser(id) {
    const user = await getUserById(id);
    if (!user) return null;
    await delAsync(id);
    return user;
}

function addUsers() {
    addUser(new User(
        'Juan',
        24,
        'math, music',
        'french',
        '-0.017316,51.508415'
    ));

    addUser({
        name: 'Pedro',
        age: 33,
        interests: 'math',
        expertises: 'music',
        location: '-0.020798,51.499090'
    });

    addUser({
        name: 'Pepe',
        age: 45,
        interests: 'french',
        expertises: 'math',
        location: '-0.189527,51.528193'
    });

    addUser({
        name: 'Marta',
        age: 21,
        interests: 'french',
        location: '2.407216,48.858021'
    });
}


function buildQueryForUser(user, maxDistKm) {
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

async function findMatches(userId, maxDistKm) {
    const user = await getUserById(userId);

    if (!user) {
        throw Error('User does not exist');
    }

    const query = buildQueryForUser(user, maxDistKm);

    const results = await searchAsync(query);

    return results.results;
}

module.exports.addUser = addUser;
module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.deleteUser = deleteUser;
module.exports.addUsers = addUsers;
module.exports.findMatches = findMatches;
