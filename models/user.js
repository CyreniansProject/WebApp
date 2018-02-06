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

module.exports.getUserByEmail = (email, callback) => {
	const query = {email: email};
	User.findOne(query, callback);
}

module.exports.getUserById = (id, callback) => {
	User.findById(id, callback);
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
            // Find user by email
            // Upate his old password with the new one
            var query = { email: userEmail };
            User.update(query, { password: newPassword }, callback);
        });
    });
}