const request = require('supertest');

var app = require('../../server');

describe('Nationalities', function() {
  describe('GET /nationalities', function() {
    it('responds with json', function(done) {
      request(app)
        .get('/api/nationality')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/, done);
    });
    it('responds with status 200', function(done) {
      request(app)
        .get('/api/nationality')
        .set('Accept', 'application/json')
        .expect(200, done);
    });
  });
});
