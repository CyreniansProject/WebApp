// Bring Mongoose into the app 
var mongoose = require('mongoose'); 

// Build the connection string 
// mongodb://georgim:123123@ds237848.mlab.com:37848/cyrenians-farm
var dbURI = 'mongodb://localhost:27017/cyrenians-farm'; 

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