// Bring Mongoose into the app 
var mongoose = require('mongoose'); 

// Build the connection string 
var dbURI = 'mongodb://georgim:405060@ds237748.mlab.com:37748/heroku_37q1v8c3'; 

// Create the database connection 
mongoose.connect(dbURI);
mongoose.Promise = global.Promise;

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
}); 