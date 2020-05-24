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

    const userToAdd = await _getUserToAdd({...previousUser, ...user}, true);

    const response = await addAsync(user.id, userToAdd, {extras: ['REPLACE', 'PARTIAL', 'NOCREATE']});
    if (response !== 'OK') {
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
        imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
        bio: 'I am Juan',
        birthDate: '1992-12-03',
        interests: ['math', 'music'],
        expertises: ['french'],
        location: {
            longitude: '-0.017316',
            latitude: '51.508415',
        },
        password: '1002k0k0Jd',
        passwordConfirmation: '1002k0k0Jd',
        email: 'juan@juan.com',
        gender: "Male"
    });

    await createUser({
        name: 'Pedro',
        imageUrl: 'https://images.pexels.com/photos/736716/pexels-photo-736716.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
        birthDate: '1984-01-23',
        bio: 'My name is Pedro, I like surfing.',
        interests: ['math'],
        expertises: ['music'],
        location: {
            longitude: '-0.020798',
            latitude: '51.499090',
        },
        password: '12039480jfpIjwe',
        passwordConfirmation: '12039480jfpIjwe',
        email: 'pedro@pedro.com',
        gender: "Male"
    });

    await createUser({
        name: 'Pepe',
        imageUrl: 'https://www.biography.com/.image/ar_8:10%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cg_faces:center%2Cq_auto:good%2Cw_620/MTY4MzU0NDMzMjc5NzMxNjcw/julian-castro-sergio-floresbloomberg-via-getty-images-square.jpg',
        birthDate: '1960-04-05',
        bio: 'Me llamo Pepe y soy re capo',
        interests: ['french'],
        expertises: ['math'],
        location: {
            longitude: '-0.189527',
            latitude: '51.528193',
        },
        password: 'j24JF0923',
        passwordConfirmation: 'j24JF0923',
        email: 'pepe@pepe.com',
        gender: "Male"

    });

    await createUser({
        name: 'Marta',
        birthDate: '2000-10-10',
        bio: 'Je suis MARTA',
        imageUrl: 'https://cdn.pixabay.com/photo/2015/12/15/21/42/person-1094988_960_720.jpg',
        interests: ['french'],
        expertises: ['something'],
        location: {
            longitude: '2.407216',
            latitude: '48.858021',
        },
        password: 'passwordJ4',
        passwordConfirmation: 'passwordJ4',
        email: 'martita@s.com',
        gender: "Male",
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
    result.interests = result.interests.split(', ');
    result.expertises = result.expertises.split(', ');
    result.location = _getLocationFromString(result.location);

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
module.exports.findUserByEmailWithPassword = findUserByEmailWithPassword;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.addTestUsers = addTestUsers;
module.exports.findMatches = findMatches;
module.exports.matchesPassword = matchesPassword;
