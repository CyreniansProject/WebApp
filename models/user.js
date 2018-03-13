var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

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

module.exports.listUsers = function(callback) {
    User.find({}, callback);
}

// TODO: edit to user userDetails instead of newly created user object
module.exports.createUser = function(userDetails, callback) {
    const newUser = new User(userDetails);
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            // Store the new user in DB
            newUser.save(callback);
        });
    });
}

module.exports.updateUser = function(_id, userDetails, callback) {
    User.update({_id}, userDetails, callback);
}

module.exports.removeUser = function(_id, callback) {
    User.remove({_id}, callback);
}

module.exports.getUserByEmail = (email, callback) => {
	User.findOne({email: email}, callback);
}

module.exports.getUserById = (_id, callback) => {
	User.findById({_id}, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.resetPassword = (userEmail, newPassword, callback) => {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newPassword, salt, function(err, hash) {
            newPassword = hash;
            // Find user by email AND
            // Upate user's old password with the new one
            User.update({email: userEmail}, {password: newPassword}, callback);
        });
    });
}

// could use in future - used for runing test mostly
module.exports.removeAll = function(callback) {
    User.remove({}, callback);
}