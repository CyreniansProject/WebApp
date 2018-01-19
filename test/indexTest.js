const chai = require('chai');
const expect = chai.expect();
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('express')

chai.use(chaiHttp);

describe('Index', function() {

    // Successful routing of index page
    it('should render the index.hb layout on /', function() {
        chai.request(server).get('/')
        .end(function(res, err) {
            expect(res.body.status).to.equal(200);
        });
    });

    // Unsuccessful routing of index page
    it('should render the index.hb layout on /index', function() {
        chai.request(server).get('/')
        .end(function(res, err) {
            expect(res.body.status).to.equal(404);
        });
    });

});