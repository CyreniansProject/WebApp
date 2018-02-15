const chai = require('chai');
const expect = chai.expect();
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('express')

const mongoose = require("mongoose");

var User = require('../models/user');

chai.use(chaiHttp);

describe('Users', () => {
    
    // Successful routing of users page
    it('should render the index.hb layout on /users', function() {
        chai.request(server).get('/users')
        .end(function(res, err) {
            expect(res.body.status).to.equal(200);
        });
    });

});
