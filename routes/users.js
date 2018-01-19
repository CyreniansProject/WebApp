const express = require('express');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
var generator = require('generate-password');

var router = express.Router();

var User = require('../models/user');

// Show users - GET
router.get('/', function(req, res){
	res.render('users/showall');
});

// Login - GET
router.get('/login', function(req, res){
	res.render('index');
});

// Login - POST
router.post('/login', function(req, res){
	res.render('index');
});

// Register - GET
router.get('/register', function(req, res) {
	res.render('users/register');
});

// Register - POST
router.post('/register', function(req, res) {
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var role = req.body.role;

	var password = generator.generate({
		length: 10,
		numbers: true
	});	

	var accessLevel;
	if(role == 0) {
	 accessLevel = "Administrator";
	}
	else if (role == 1) {
		accessLevel = "Staff member";
	}
	else if (role == 2)
	{
		accessLevel = "Delivery man";
	}

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
		<li>Step 1: Click on this link: <a href="http://localhost:3000/users/reset/${email}">Complete account creation!</a></li>
		<li>Step 2: Type in your preffered password and confirm it.</li>
		<li>Step 3: Sign in to the system with your email and newly set password.</li>
		</ul>
	`;

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
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
	let mailOptions = {
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
		res.render('users/register', { errors: validErrors });
	}
	else {
		var newUser = new User(
		{
			firstname: firstname,
			lastname: lastname,
			email: email,
			password: password,
			role: role
		});

		User.createUser(newUser, function(err, user) {
			if(err) throw err;
			console.log(user);

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error);
				}

				req.flash('success_msg', 'User was successfully created.');
				// delay for 3 seconds and redirect to dashboard
				setTimeout(() => res.redirect('/'), 3000);
			});
		});
	}
});

// Reset - GET
router.get('/reset', function(req, res) {
	res.render('users/reset');
});

router.get('/reset/:email', function(req, res) {
	var email = req.params.email;
	res.render('users/reset', { email: email });
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
		res.render('users/reset', { errors: validErrors });
	}
	else {
		// Find user by Email func.
		// then send User as param instead of email and password
		// then alter the resetPassword func.
		User.resetPassword(email, password, function(err) {
			if(err) throw err;

			req.flash('success_msg', 'Password was successfully updated.');

			console.log(User);

			// delay for 3 seconds and redirect to login
			setTimeout(() => res.render('users/login'), 3000);
		});
	}
});

module.exports = router;