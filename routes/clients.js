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
    Client.find({}, function(err, clients) {
        if (err) throw err;
        res.json({clientList: clients});
    });
});

router.get('/:id', function(req, res) {
    const id = req.params.id;
    
    Client.findById({_id: id}, function(err, client) {
        if (err) throw err;

        res.json(client);
    });
});

router.post('/new', function(req, res) {
    const name = req.body.name;
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

    Client.createClient(clientDetails, function(err, client) {
        if (err) throw err;
        res.json({
            message:"Client " + client.name + " was created.", 
            client: client
        });
    });
});

router.post('/update', function(req, res) {
    const clientId = req.body.clientId;

    const name = req.body.name;
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

    Client.updateClient(clientId, clientDetails, function(err, client) {
        if (err) throw err;
        res.json({
            message:"Client " + client.name + " was created.", 
            output: client
        });
    });
});

router.post('/remove', function(req, res) {
    const clientId = req.body.clientId;

    Client.findById({_id: clientId}, function(existErr, client) {
        if (existErr) throw existErr;
        const name = client.name;
        Client.removeClient(id, function(err) {
            if (err) throw err;
            res.json("The client " + name + " was removed successfully!");
        });
    });
})

module.exports = router;