const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../models');

const la = {
  cssrRecord: {
    id: 123,
    name: 'Kirklees',
    nmdsIdLetter: 'J',
  },
};

describe('models.pcodedata', async () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getLinkedCssrRecordsFromPostcode', async () => {
    it('should return a cssr record when a matching postcode with a corresponding cssr entry is found', async () => {
      const response = { postcode: 'HD1 1DA', ...la };

      const stubCompleteMatch = sinon
        .stub(models.pcodedata, 'getLinkedCssrRecordsCompleteMatch')
        .callsFake(async () => {
          return response;
        });
      const stubPartialMatch = sinon.stub(models.pcodedata, 'getLinkedCssrRecordsLooseMatch').callsFake(async () => {
        console.log('This should not be hit');
      });

      const localAuth = await models.pcodedata.getLinkedCssrRecordsFromPostcode('HD1 1DA');
      expect(localAuth).to.deep.equal(response);
      expect(stubCompleteMatch.calledOnce);
      expect(stubCompleteMatch.withArgs('HD1 1DA'));
      expect(stubPartialMatch.notCalled);
    });
  });

  describe('when no exact match is found', async () => {
    let stubCompleteMatch;
    beforeEach(() => {
      stubCompleteMatch = sinon.stub(models.pcodedata, 'getLinkedCssrRecordsCompleteMatch').callsFake(async () => {
        return null;
      });
    });

    it('should attempt to find a cssr corresponding to similar postcodes', async () => {
      const stubPartialMatch = sinon.stub(models.pcodedata, 'getLinkedCssrRecordsLooseMatch').callsFake(async () => {
        return null;
      });

      await models.pcodedata.getLinkedCssrRecordsFromPostcode('HD1 1DA');
      expect(stubCompleteMatch.calledOnce);
      expect(stubPartialMatch.calledThrice);
      expect(stubPartialMatch.calledWith('HD1 1D'));
      expect(stubPartialMatch.calledWith('HD1 1'));
      expect(stubPartialMatch.calledWith('HD1'));
    });

    it('should return a cssr corresponding to a similar postcode', async () => {
      const response = { postcode: 'HD1 1DZ', ...la };

      const stubPartialMatch = sinon.stub(models.pcodedata, 'getLinkedCssrRecordsLooseMatch').callsFake(async () => {
        return response;
      });

      const localAuth = await models.pcodedata.getLinkedCssrRecordsFromPostcode('HD1 1DA');
      expect(localAuth).to.deep.equal(response);
      expect(stubCompleteMatch.calledOnce);
      expect(stubPartialMatch.calledOnce);
      expect(stubPartialMatch.calledWith('HD1 1D'));
    });
  });

  // TODO CircleCI does not talk to database
  describe.skip('do not mock, should always return a response if data available', async () => {
    it('this should always return a record if there is KT2 unless lookup has failed (Kingston upon Thames)', async () => {
      let la2 = {
        cssrRecord: {
          id: 729,
          name: 'Kingston upon Thames',
          nmdsIdLetter: 'G',
        },
      };

      let postcode = 'KT2 6AP';

      const records = await models.pcodedata.getLinkedCssrRecordsFromPostcode(postcode);

      expect(records[0].cssrRecord.id).to.equal(la2.cssrRecord.id);
      expect(records[0].cssrRecord.name).to.equal(la2.cssrRecord.name);
    });

    it('this should always return a record', async () => {
      let la2 = {
        cssrRecord: {
          id: 110,
          name: 'Sunderland',
          nmdsIdLetter: '',
        },
      };

      let postcode = 'SR2 7TZ';
      const records = await models.pcodedata.getLinkedCssrRecordsFromPostcode(postcode);

      expect(records[0].cssrRecord.id).to.equal(la2.cssrRecord.id);
      expect(records[0].cssrRecord.name).to.equal(la2.cssrRecord.name);
    });
  });
});
