const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

const Client = require('../models/client');

router.get('/', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            Client.find({}, function(err, clients) {
                if (err) throw err;
                res.render('clients/index', { layout: 'layout_staff.handlebars', page_title: 'Client list', 
                user: req.user, clients: clients });
            });
        }
        else {
            req.flash('error_msg', 'You don\'t have the authority to access this page!');
			res.redirect('/api/dashboard');
        }
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

router.get('/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            res.render('clients/addClient', { layout: 'layout_staff.handlebars', page_title: 'New client', user: req.user});
        }
        else {
            req.flash('error_msg', 'You don\'t have the authority to access this page!');
			res.redirect('/api/dashboard');
        }
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

router.post('/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const name = req.body.fullname;
            const email = req.body.email;
            const account = req.body.account;
            // TODO (possibly): Split 'address' / Collection point into 6 fields: 
            /** !!!!!!!!!!!!!!!!!!!!!!!!
            ** Address Line 1 (Street address, P.O. box, Company name) - required
            ** Address Line 2 (Apartment, suite, unit, building floor) - optional
            ** City/Town - required
            ** State/Province/Region - optional
            ** Zip/Postal Code - required
            ** Country - required
            **/
            const address = req.body.address;
            const frequency = req.body.frequency;
            
            // Validation
            req.check('fullname', 'Full name is required').notEmpty();
            req.check('email', 'Email is required').isEmail();
            req.check('account', 'Bank account (number) is required').isNumeric();
            req.check('address', 'Collection point is required').notEmpty();
            req.check('frequency', 'Frequency (selection) is required').not().equals("Choose...");
            // Store validation errors if any...
            var validErrors = req.validationErrors();

            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                const clientDetails = {
                    name: name,
                    frequency: frequency,
                    email: email,
                    account: account,
                    address: address
                };

                Client.createClient(clientDetails, function(err, client) {
                    if (err) throw err;
                    res.redirect('/api/clients');
                });
            }
        }
        else {
            req.flash('error_msg', 'You don\'t have the authority to access this page!');
            res.redirect('/api/dashboard');
        }
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

router.get('/edit/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.params.id;
            
            Client.findById({_id: id}, function(err, client) {
                if (err) throw err;
                res.render('clients/editClient', { layout: 'layout_staff.handlebars', page_title: 'Client: ' + client.name, 
                user: req.user, client: client });
            });
        }
        else {
            req.flash('error_msg', 'You don\'t have the authority to access this page!');
            res.redirect('/api/dashboard');
        }
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

router.post('/update', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.body.clientId;

            const name = req.body.fullname;
            const frequency = req.body.frequency;
            const email = req.body.email;
            const account = req.body.account;
            const address = req.body.address;

            // Validation
            req.check('fullname', 'Full name is required').notEmpty();
            req.check('email', 'Email is required').isEmail();
            req.check('account', 'Bank account (number) is required').isNumeric();
            req.check('address', 'Collection point is required').notEmpty();
            req.check('frequency', 'Frequency (selection) is required').not().equals("Choose...");
            // Store validation errors if any...
            var validErrors = req.validationErrors();

            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                const clientDetails = {
                    name: name,
                    frequency: frequency,
                    email: email,
                    account: account,
                    address: address
                };

                Client.updateClient(id, clientDetails, function(err, client) {
                    if (err) throw err;
                    req.flash('success_msg', 'Client successfully updated!');
                    res.redirect('back');
                });
            }
        }
        else {
            req.flash('error_msg', 'You don\'t have the authority to access this page!');
            res.redirect('/api/dashboard');
        }
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

router.get('/remove/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.params.id;
            Client.removeClient(id, function(err) {
                if (err) throw err;
                req.flash('success_msg', 'Client successfully removed!');
                res.redirect('back');
            });
        }
        else {
            req.flash('error_msg', 'You don\'t have the authority to access this page!');
            res.redirect('/api/dashboard');
        }
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

module.exports = router;