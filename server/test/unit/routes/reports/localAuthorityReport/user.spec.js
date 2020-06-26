'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const userReport = require('../../../../../routes/reports/localAuthorityReport/user');
const models = require('../../../../../models');

const la = {
  theAuthority: {
    id: 123,
    name: 'Kirklees',
    nmdsIdLetter: 'J'
  }
};
const la2 = {
  CssrID: 123,
  CssR: 'Leeds'
};

describe('/server/routes/reports/localAuthorityReport/user', () => {
  describe('identifyLocalAuthority()', () => {
    beforeEach(() => {
      sinon.stub(models.pcodedata, 'findOne').callsFake(async (args) => {
        return args.where.postcode === 'HD1 1DA' ?
        {postcode: args.where.postcode, ...la} : null;
      });
      sinon.stub(models.sequelize, 'query').callsFake(async (args) => {
        return args.indexOf('LS1') > -1 ?
        [la2] : [];
      });
    });
    afterEach(()=> {
      sinon.restore();
    });
    it('should return a la if one is found in postcodedata table', async () => {
      const localAuth = await userReport.identifyLocalAuthority('HD1 1DA');
      expect(localAuth).to.deep.equal(la.theAuthority.name);
    });
    it('should return a la if one is not found in postcodedata table but it is found via fuzzy match', async () => {
      const localAuth = await userReport.identifyLocalAuthority('LS1 1AA');
      expect(localAuth).to.deep.equal(la2.CssR);
    });
    it('should return nothing if none is found', async () => {
      const localAuth = await userReport.identifyLocalAuthority('BD1 1AA');
      expect(localAuth).to.deep.equal('');
    });
  });
});
