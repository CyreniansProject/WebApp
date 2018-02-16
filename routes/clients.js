const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

const Client = require('../models/client');
/** !!!
 ** THIS IS A BASE AND PURE API WITH NO FRONT-END CONNECTION ATM!

 ** NOTE: AFTER RECEIVING THE FRONT-END TEMPLATE,
 ** DO: if (req.user) { ... res.render(...) } else { res.flash(...) res.redirect(...) }
 ** WITH USER LEVEL RESTRICTIONS AS WELL WHERE APPLICABLE
!!! **/

router.get('/', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            Client.find({}, function(err, clients) {
                // Display all items by name category. -> name & avgWeight just once AND THEN =>
                // Calculate totalWeight and totalAmount from all items within the name category
                // Display the calculated fileds.
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
            const address = req.body.address;
            const frequency = req.body.frequency;
            // VALIDATION ... TODO

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

            // VALIDATION ... TODO

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
})

module.exports = router;