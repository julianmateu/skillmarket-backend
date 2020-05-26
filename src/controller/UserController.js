const {promisify} = require('util');
const {v4: uuidv4} = require('uuid');
const {hash, compare} = require('bcryptjs');
const _ = require('lodash');

const {BCRYPT_WORK_FACTOR} = require('../config/auth');
const {searchClient} = require('../db');
const {registerSchema, idSchema, updateSchema, emailSchema, distanceSchema} = require('../validation/auth');
const {validate} = require('../validation/joi');
const {NotFound, BadRequest} = require('../errors');

const addAsync = promisify(searchClient.add).bind(searchClient);
const getDocAsync = promisify(searchClient.getDoc).bind(searchClient);
const searchAsync = promisify(searchClient.search).bind(searchClient);
const delAsync = promisify(searchClient.delDoc).bind(searchClient);

async function createUser(user) {
    await validate(registerSchema, user);

    let found = true;
    let previous = null;
    try {
        previous = await findUserByEmailWithPassword(user.email);
    } catch (err) {
        if (err instanceof NotFound) {
            found = false;
        } else {
            throw err;
        }
    }

    if (found || previous) {
        throw new BadRequest("Email already exists");
    }

    const userToAdd = await _getUserToAdd(user);
    const id = uuidv4();

    const response = await addAsync(id, userToAdd);
    if (response !== 'OK') {
        throw Error(response);
    }
    return _processDBUser({doc: userToAdd, docId: id}, false);
}

async function findUserById(id) {
    await validate(idSchema, id);
    const dbUser = await getDocAsync(id);
    if (Object.keys(dbUser.doc).length === 0) {
        throw new NotFound();
    }
    return _processDBUser({...dbUser, docId: id}, false);
}

async function findUserByEmailWithPassword(email) {
    await validate(emailSchema, email);

    const query = `@email:${email.replace('@', '/@/')}`;
    const { results } = await searchAsync(query);

    if (results.length === 0) {
        throw new NotFound('Email is not registered.');
    }

    if (results.length > 1) {
        throw Error('Multiple users with that email.');
    }

    const dbUser = results[0];
    return _processDBUser(dbUser, true);
}

async function retrieveUsers() {
    const result = await searchAsync('*');
    return result.results.map(u => _processDBUser(u, false));
}

async function updateUser(user) {
    await validate(updateSchema, user);
    const previousUser = await findUserById(user.id);

    // TODO we probably need a different method only for updating the credentials.
    const userToAdd = await _getUserToAdd({...previousUser, ...user}, !user.password);

    const response = await addAsync(user.id, userToAdd, {extras: ['REPLACE', 'PARTIAL', 'NOCREATE']});
    if (response !== 'OK') {
        console.log(JSON.stringify(response));
        throw Error(response);
    }
    return _processDBUser({doc: userToAdd, docId: user.id}, false);
}

async function deleteUser(id) {
    await validate(idSchema, id);
    const user = await findUserById(id);
    if (!user) return null;
    await delAsync(id);
    return user;
}

async function findMatches(userId, maxDistKm) {
    await validate(idSchema, userId);
    await validate(distanceSchema, maxDistKm);
    const user = await findUserById(userId);

    if (!user) {
        throw Error('User does not exist');
    }

    const query = _buildQueryForUser(user, maxDistKm);

    const results = await searchAsync(query);

    return results.results.map(u => _processDBUser(u, false));
}

async function matchesPassword(user, password) {
    return compare(password, user.password);
}

// TODO: move to unit tests
async function addTestUsers() {
    await createUser({
        name: 'Juan',
        imageUrl: 'https://images.generated.photos/Q1r_2ktVEZBk_6osS-G8SGzIVUCa1IQGj5W_dp4xiMQ/rs:fit:512:512/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA3NzExNDUuanBn.jpg',
        // imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
        bio: 'I am a musician and I love art. I would like to meet people who love jazz and walks in the park.',
        birthDate: '1992-12-03',
        interests: ['math', 'art', 'jazz'],
        expertises: ['french', 'music'],
        location: {
            longitude: '-0.017316',
            latitude: '51.508415',
        },
        password: '1002k0k0Jd',
        passwordConfirmation: '1002k0k0Jd',
        email: 'juan@skillmarket.com',
        gender: "Male",
    });

    await createUser({
        name: 'Pedro',
        imageUrl: 'https://images.generated.photos/R2JFP1ebaEziLj7DDxflzAG_BU6T1GYd-ShH6xPWsqY/rs:fit:512:512/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzAwMDk2MjIuanBn.jpg',
        // imageUrl: 'https://images.pexels.com/photos/736716/pexels-photo-736716.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
        birthDate: '1984-01-23',
        bio: 'My name is Pedro, I am spanish and I like surfing. Let\'s talk and practise sports together',
        interests: ['art', 'sports', 'music'],
        expertises: ['surf', 'math'],
        location: {
            longitude: '-0.020798',
            latitude: '51.499090',
        },
        password: '12039480jfpIjwe',
        passwordConfirmation: '12039480jfpIjwe',
        email: 'pedro@skillmarket.com',
        gender: "Male",
    });

    await createUser({
        name: 'Ted',
        imageUrl: 'https://images.generated.photos/FdlezoWEFR-2X5QMTN9_PxpIiz11RSL4aQD4GK9vxR8/rs:fit:512:512/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA5OTgwNDUuanBn.jpg',
        // imageUrl: 'https://www.biography.com/.image/ar_8:10%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cg_faces:center%2Cq_auto:good%2Cw_620/MTY4MzU0NDMzMjc5NzMxNjcw/julian-castro-sergio-floresbloomberg-via-getty-images-square.jpg',
        birthDate: '1979-04-05',
        bio: 'I am a film producer and teach photography. I would like to learn more about science.',
        interests: ['math', 'science'],
        expertises: ['art', 'photography', 'films'],
        location: {
            longitude: '-0.189527',
            latitude: '51.528193',
        },
        password: 'j24JF0923',
        passwordConfirmation: 'j24JF0923',
        email: 'ted@skillmarket.com',
        gender: "Male",

    });

    await createUser({
        name: 'Akari',
        birthDate: '2000-10-10',
        bio: 'I want to learn to play the guitar, and I can teach you french in exchange!',
        imageUrl: 'https://images.generated.photos/LrQ7S_IFhuREjDX82pe_q7ncjW_jHYjQrvgpz6SBY9g/rs:fit:512:512/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzAzODI3OTMuanBn.jpg',
        interests: ['guitar', 'music', 'jazz'],
        expertises: ['french'],
        location: {
            longitude: '-0.073563',
            latitude: '51.494493',
        },
        password: 'passwordJ4',
        passwordConfirmation: 'passwordJ4',
        email: 'akari@skillmarket.com',
        gender: "Female",
    });

    await createUser({
        name: 'Liz',
        birthDate: '1987-10-10',
        bio: 'I am a lawyer but enjoy going to museums on my free time. I want to learn about photography.',
        imageUrl: 'https://images.generated.photos/xFe8q_crSDkFTuhSxipofWaPtaajD4vdpHuT1mXnTmA/rs:fit:512:512/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzAxOTU0MDEuanBn.jpg',
        interests: ['photography', 'music'],
        expertises: ['french', 'law'],
        location: {
            longitude: '-0.104910',
            latitude: '51.532530',
        },
        password: 'passwordJ4',
        passwordConfirmation: 'passwordJ4',
        email: 'liz@skillmarket.com',
        gender: "Female",
    });
}

function _processDBUser(dbUser, returnInternals=false) {
    const userToGet = returnInternals ? dbUser.doc : _.pick(dbUser.doc, [
        'name',
        'birthDate',
        'email',
        'interests',
        'expertises',
        'location',
        'imageUrl',
        'bio',
        'gender',
    ]);

    const result = {...JSON.parse(JSON.stringify(userToGet)), id: dbUser.docId};
    result.interests = result.interests ? result.interests.split(', ') : [];
    result.expertises = result.expertises ? result.expertises.split(', ') : [];
    result.location = result.location ? _getLocationFromString(result.location) : undefined;

    return result;
}

function _getLocationFromString(s) {
    const [longitude, latitude] = s.split(',');
    return {longitude, latitude};
}


async function _getUserToAdd(user, isUpdate=false) {
    var userToAdd = _.pick(user, [
        'name',
        'birthDate',
        'email',
        'gender',
        'password',
        'interests',
        'expertises',
        'location',
        'imageUrl',
        'bio',
    ]);

    if (!isUpdate) {
        userToAdd.password = await hash(userToAdd.password, BCRYPT_WORK_FACTOR);
    }
    userToAdd.name = userToAdd.name ? userToAdd.name : undefined;
    userToAdd.birthDate = userToAdd.birthDate ? new Date(userToAdd.birthDate).toISOString().split('T')[0] : undefined;
    userToAdd.interests = userToAdd.interests ? userToAdd.interests.join(', ') : undefined;
    userToAdd.expertises = userToAdd.expertises ? userToAdd.expertises.join(', ') : undefined;
    userToAdd.location = userToAdd.location ? `${userToAdd.location.longitude},${userToAdd.location.latitude}` : undefined;

    Object.keys(userToAdd).forEach(key => userToAdd[key] === undefined ? delete userToAdd[key] : {});

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
module.exports.findUserByEmailWithPassword = findUserByEmailWithPassword;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.addTestUsers = addTestUsers;
module.exports.findMatches = findMatches;
module.exports.matchesPassword = matchesPassword;
