const { compare } = require('bcryptjs');

class User {
    name;
    birthDate;
    interests;
    expertises;
    location;
    password;
    email;
    id;

    constructor(name, birthDate, interests, expertises, location, password, email, id) {
        this.name = name;
        this.birthDate = birthDate;
        this.interests = interests;
        this.expertises = expertises;
        this.location = location;
        this.password = password;
        this.email = email;
        this.id = id;
    }

    matchesPassword(password) {
        return compare(password, this.password);
    }
}

module.exports = User;
