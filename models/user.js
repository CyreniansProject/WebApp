var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;

var UserSchema = mongoose.Schema({
    email: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    role: {
        type: Number
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.removeAll = function(callback) {
    User.remove({}, callback);
}

module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            // Store the new user in DB
            newUser.save(callback);
        });
    });
}

module.exports.getIsUserAdministrator = (callback) => {
    const query = {role: '0'};
    User.findOne(query, callback);
}

module.exports.getIsUserStaff = (callback) => {
    const query = {role: '1'};
    User.findOne(query, callback);
}

module.exports.getIsUserDriver = (callback) => {
    const query = {role: '2'};
    User.findOne(query, callback);
}

module.exports.getUserByEmail = (username, callback) => {
	const query = {email: email};
	User.findOne(query, callback);
}

module.exports.getUserById = (id, callback) => {
	User.findById(id, callback);
}

module.exports.comparePasswords = (guess, stored, callback) => {
    bcrypt.compare(guess, stored, callback);
}

module.exports.resetPassword = (userEmail, newPassword, callback) => {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newPassword, salt, function(err, hash) {
            newPassword = hash;
            // Find user by email
            // Upate his old password with the new one
            var query = { email: userEmail };
            User.update(query, { password: newPassword }, callback);
        });
    });
}