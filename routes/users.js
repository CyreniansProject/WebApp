const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const passport = require('passport');
var generator = require('generate-password'); 
var bcrypt = require('bcryptjs');

const User = require('../models/user');
require('../middlewares/authenticate');

// Index - GET
router.get('/', function(req, res) {
	if (req.user) {
		if (req.user.role == 0) {
			User.listUsers(function(err, users) {
				if (err) throw err;
                res.render('users/index', { layout: 'layout_staff.handlebars', page_title: 'Staff members', 
                user: req.user, users: users });
            });
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

// Login - POST
router.post('/login', passport.authenticate('local', { 
	successRedirect: '/api/dashboard', failureRedirect: '/', failureFlash: true }),
	(req, res) => { res.redirect('/');
});

router.get('/logout', function(req, res) {
	if (req.user) {
		req.logout();
		req.flash('success_msg', 'You have logged out');
		res.redirect('/');
	}
});

// Register - GET
router.get('/new', function(req, res) {
	if (req.user) {
		if (req.user.role == 0) {
			res.render('users/addUser', { layout: 'layout_staff.handlebars', page_title: 'Add Member' });
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
router.post('/new', function(req, res) {
	if (req.user) {
		if (req.user.role == 0) {
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
				<li>Step 1: Click on this link: <a href="http://vbd.cyrenians.scot/api/users/reset/${email}">Complete account creation!</a></li>
				<li>Step 2: Type in your preffered password and confirm it.</li>
				<li>Step 3: Sign in to the system with your email and newly set password.</li>
				</ul>
			`;

			// create reusable transporter object using the default SMTP transport
			const transporter = nodemailer.createTransport({
				host: 'mail.georgim.com',
				port: 25,
				secure: false, // true for 465, false for any other ports
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
				to: email, // list of receivers
				subject: 'Account completion request', // Subject line
				text: 'Set your password!', // plain text body
				html: output // html body
			};
			// END EMAIL CREATION

			// Validation
			req.check('firstname', 'First Name is required').notEmpty();
			req.check('lastname', 'Last Name is required').notEmpty();
			req.check('email', 'Email is required').isEmail();
			req.check('role', 'Access level (selection) is required').not().equals("Choose...");
			
			// Store validation errors if any...
			var validErrors = req.validationErrors();
			// Attempt User creation
			if (validErrors) {
				req.flash('valid_msg', validErrors[0].msg);
				res.redirect('back');
			}
			else {
				const userDetails = {
					firstname: firstname,
					lastname: lastname,
					email: email,
					password: password,
					role: role
				}

				User.createUser(userDetails, function(err, user) {
					if(err) throw err;

					// send mail with defined transport object
					transporter.sendMail(mailOptions, (mailErr, info) => {
						if (mailErr) return mailErr;

						req.flash('success_msg', 'User was successfully created.');
						res.redirect('/api/users');
					});
				});
			}
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

// Edit - GET
router.get('/edit/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0) {
			const id = req.params.id;
			User.getUserById(id, function(err, member) {
                if (err) throw err;
				res.render('users/editUser', { layout: 'layout_staff.handlebars', 
				page_title: 'Edit ' + member.firstname + ' ' + member.lastname,
                user: req.user, member: member, memberId: id});
            });
		}
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
		
		res.render('users/profile', { layout: 'layout_staff.handlebars', page_title: 'Hi ' + req.user.firstname + ' | Profile', 
		user: req.user, access: accessLevel });
	}
	else {
		req.flash('error_msg', 'You need to login first!');
		res.redirect('/');
	}
});

// Update - POST
router.post('/update', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
			const id = req.body.userId;

			const firstname = req.body.firstname;
			const lastname = req.body.lastname;
			const email = req.body.email;
			const role = req.body.role;
			
			// Validation
			req.check('firstname', 'First Name is required').notEmpty();
			req.check('lastname', 'Last Name is required').notEmpty();
			req.check('email', 'Email is required').isEmail();
			req.check('role', 'Access level selection is required').not().equals("Choose...");

			// Store validation errors if any...
			var validErrors = req.validationErrors();
			// Attempt User update
			if (validErrors) {
				req.flash('valid_msg', validErrors[0].msg);			
				res.redirect('back');
			}
			else {
				const userDetails = {
					firstname: firstname,
					lastname: lastname,
					email: email,
					role: role
				};

				// Update the user field details
				User.updateUser(id, userDetails, function(err, updatedUser) {
					if (err) throw err; 
					req.flash('success_msg', 'User details successfully updated!');
					res.redirect('back');
				});	
			}
		}
	}
});

// Delete - GET
router.get('/remove/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
			const id = req.params.id;
			User.removeUser(id, function(err) {
                if (err) throw err;
                req.flash('success_msg', 'User/Member successfully removed!');
                res.redirect('back');
            });
		}
	}
});

// Reset - GET
router.get('/reset/:email', function(req, res) {
	var email = req.params.email;
	if (req.user && req.user.email == email)
		res.redirect('/api/dashboard');
	else
		res.render('users/reset', { page_title: 'Reset password', email: email });
});

// Reset - POST
router.post('/reset', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var confirmPassword = req.body.confirmPassword;

	// Validation
	req.check('email', 'The email is wrong / does not exist in the database').isEmail();
	req.check('password', 'Password field is required').notEmpty();
	req.check('confirmPassword', 'Both passwords do not match').equals(req.body.password);
	// Store validation errors if any...
	var validErrors = req.validationErrors();

	// Attempt User creation
	if (validErrors) {
		req.flash('valid_msg', validErrors[0].msg);
		res.redirect('back');
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