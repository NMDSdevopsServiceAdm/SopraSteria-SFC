const request = require('supertest');

var app = require('../../../server');

describe('Countries', function() {
  describe('GET /country', function() {
    // Check to make sure that the reply has the correct JSON header
    it('responds with json', function(done) {
      request(app)
        .get('/api/country')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/, done);
    });
    // Check to make sure that the status is correct
    it('responds with status 200', function(done) {
      request(app)
        .get('/api/country')
        .set('Accept', 'application/json')
        .expect(200, done);
    });
  });
});
