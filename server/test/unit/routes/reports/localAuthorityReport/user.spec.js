'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const userReport = require('../../../../../routes/reports/localAuthorityReport/user');
const models = require('../../../../../models');

describe.skip('/server/routes/reports/localAuthorityReport/user', () => {
  describe('identifyLocalAuthority()', () => {
    beforeAll(() => {

    });
    afterAll(()=> {
      sinon.restore();
    });
    it('should return a postcode if one is found in postcodedata table', () => {

    });
  });
});
