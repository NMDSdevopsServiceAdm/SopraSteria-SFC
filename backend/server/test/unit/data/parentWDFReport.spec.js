const expect = require('chai').expect;
const sinon = require('sinon');

const { getEstablishmentData } = require('../../../data/parentWDFReport');
const WdfCalculatorModule = require('../../../models/classes/wdfCalculator');
const db = require('../../../utils/datastore');

describe('backend/server/data/parentWDFReport.js', () => {
  describe('getEstablishmentData', () => {
    it('should get the updated WdfEffectiveDate at runtime', async () => {
      sinon.stub(db, 'query').resolves({});
      const getWDFeffectiveDate = sinon.spy(WdfCalculatorModule.WdfCalculator, 'effectiveDate', ['get']);

      await getEstablishmentData('mock-establishment-id');

      expect(getWDFeffectiveDate.get).to.have.been.called;
    });
  });
});
