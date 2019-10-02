const expect = require('chai').expect;
const request = require('supertest');
const express = require('express');

const app = express();

describe('GET /nationalities', function() {
  it('responds with json', function(done) {
    request(app)
      .get('/api/nationalities')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
