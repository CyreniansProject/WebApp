const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const passport = require('passport');
var generator = require('generate-password'); 

const User = require('../models/user');
require('../middlewares/authenticate');

// Index - GET
router.get('/', function(req, res) {
	if (req.user) {
		if (req.user.role == 0) {
			res.render('users/index', { layout: 'layout_staff.handlebars', page_title: 'Staff members' });
		}
		else {
			req.flash('error_msg', 'You don\'t have the authority to add new staff members!');
			res.redirect('/api/dashboard');
		}
	}	
	else {
		req.flash('error_msg', 'You need to login first!');
		res.redirect('/');
	}
});

// Profile - GET
router.get('/profile', function(req, res) {
	if (req.user) {
		var accessLevel;
		if(req.user.role == 0)
			accessLevel = "Administrator";
		else if (req.user.role == 1)
			accessLevel = "Staff member";
		else if (req.user.role == 2)
			accessLevel = "Delivery man";
		
		res.render('users/profile', { layout: 'layout_staff.handlebars', page_title: 'My profile', user: req.user, access: accessLevel });
	}
	else {
		req.flash('error_msg', 'You need to login first!');
		res.redirect('/');
	}
});

// Login - POST
router.post('/login',
	passport.authenticate('local', { successRedirect: '/api/dashboard', failureRedirect: '/', failureFlash: true }),
	(req, res) => { res.redirect('/');
});

router.get('/logout', function(req, res) {
	if (req.user) {
		req.logout();
		req.flash('success_msg', 'You are logged out');
		res.redirect('/');
	}
});

// Register - GET
router.get('/register', function(req, res) {
	if (req.user) {
		if (req.user.role == 0) {
			res.render('users/register', { layout: 'layout_staff.handlebars', page_title: 'Add member' });
		}
		else {
			req.flash('error_msg', 'You don\'t have the authority to add new staff members!');
			res.redirect('/api/dashboard');
		}
	}	
	else {
		req.flash('error_msg', 'You need to login first!');
		res.redirect('/');
	}
});

// Register - POST
router.post('/register', function(req, res) {
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const email = req.body.email;
	const role = req.body.role;
	
	var password = generator.generate({
		length: 10,
		numbers: true
	})

	var accessLevel;
	if(role == 0)
		accessLevel = "Administrator";
	else if (role == 1)
		accessLevel = "Staff member";
	else if (role == 2)
		accessLevel = "Delivery man";

	// CREATE EMAIL
	const output = `
		<p>Hi ${firstname} ${lastname}, </p><br/>
		<p>Congratulations for beign added to Cyrenians Farm's management system.</p>
		<h3>Accout details</h3>
		<ul>
			<li>Email (LoginID): ${email}</li>
			<li>Access level: ${accessLevel}</li>
			<li>Temporary password: ${password} - Safe, but hard to remember. Not recommended.</li>
		</ul>
		<br/><strong>IMPORTANT:</strong> Set your own password.<br/>
		<ul>
		<li>Step 1: Click on this link: <a href="http://localhost:3000/api/users/reset/${email}">Complete account creation!</a></li>
		<li>Step 2: Type in your preffered password and confirm it.</li>
		<li>Step 3: Sign in to the system with your email and newly set password.</li>
		</ul>
	`;

	// create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport({
		host: 'mail.georgim.com',
		port: 25,
		secure: false, // true for 465, false for other ports
		auth: {
			user: 'georgi@georgim.com', // generated ethereal user
			pass: '405060Gg'  // generated ethereal password
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	// setup email data with unicode symbols
	const mailOptions = {
		from: '"Georgi @ Cyrenians Farm" <georgi@georgim.com>', // sender address
		to: 'georgimweb@gmail.com', // list of receivers
		subject: 'Account completion request', // Subject line
		text: 'Set your password!', // plain text body
		html: output // html body
	};
	// END EMAIL CREATION

	// Validation
	req.check('firstname', 'First Name is required').notEmpty();
	req.check('lastname', 'Last Name is required').notEmpty();
	req.check('email', 'Email is required').isEmail();
	req.check('role', 'Access level selection is required').not().equals("Choose...");
	
	// Store validation errors if any...
	var validErrors = req.validationErrors();
	// Attempt User creation
	if (validErrors) {
		res.render('users/register', { layout: 'layout_staff.handlebars', page_title: 'Add member', errors: validErrors });
	}
	else {
		var newUser = new User({
			firstname: firstname,
			lastname: lastname,
			email: email,
			password: password,
			role: role
		});

		User.createUser(newUser, function(err, user) {
			if(err) throw err;

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error);
				}

				req.flash('success_msg', 'User was successfully created.');
				res.redirect('/api/users');
			});
		});
	}
});

// Reset - GET
router.get('/reset/:email', function(req, res) {
	var email = req.params.email;
	res.render('users/reset', { page_title: 'Reset password', email: email });
});

// Reset - POST
router.post('/reset', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var confirmPassword = req.body.confirmPassword;

	req.check('email', 'The email is wrong / does not exist in the database').isEmail();
	req.check('password', 'Password is required').notEmpty();
	req.check('confirmPassword', 'Passwords do not match').equals(req.body.password);
	// Store validation errors if any...
	var validErrors = req.validationErrors();

	// Attempt User creation
	if (validErrors) {
		res.render('users/reset', { page_title: 'Reset password', errors: validErrors });
	}
	else {
		// Find user by Email func.
		// then send User as param instead of email and password
		// then alter the resetPassword func.
		User.resetPassword(email, password, (err) => {
			if(err) throw err;

			req.flash('success_msg', 'Password was successfully updated.');
			// delay for 3 seconds and redirect to login
			res.redirect('/');
		});
	}
});

module.exports = router;