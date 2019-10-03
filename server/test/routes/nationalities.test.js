const request = require('supertest');

var app = require('../../../server');

describe('Nationalities', function() {
  describe('GET /nationality', function() {
    // Check to make sure that the reply has the correct JSON header
    it('responds with json', function(done) {
      request(app)
        .get('/api/nationality')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/, done);
    });
    // Check to make sure that the status is correct
    it('responds with status 200', function(done) {
      request(app)
        .get('/api/nationality')
        .set('Accept', 'application/json')
        .expect(200, done);
    });
  });
});
