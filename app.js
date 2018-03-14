const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
const helpers = require('handlebars-helpers')();
require('./config/db.js');

const landing = require('./routes/index');
const dashboard = require('./routes/dashboard');
const users = require('./routes/users');
const clients = require('./routes/clients');
const orders = require('./routes/orders');
const stock = require('./routes/stock');
const bags = require('./routes/bags');
const reports = require('./routes/reports');
const driver = require('./routes/driver');
// Init App
const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.valid_msg = req.flash('valid_msg');
  res.locals.app_err_msg = req.flash('app_err_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', landing);
app.use('/api/users', users);
app.use('/api/dashboard', dashboard);
app.use('/api/clients', clients);
app.use('/api/orders', orders);
app.use('/api/stock', stock);
app.use('/api/bags', bags);
app.use('/api/reports', reports);
app.use('/api/driver', driver);

// Set Port
app.set('port', (process.env.PORT || 80));
// Start server port listener
app.listen(app.get('port'), () => console.log('Server started on port ' + app.get('port')));