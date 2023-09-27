const expect = require('chai').expect;
const sinon = require('sinon');

const cssrRecord = require('../../../../services/cssr-records/cssr-record');
const cssrRecordData = require('../../../../services/cssr-records/cssrRecordData');

const la = {
  theAuthority: {
    id: 123,
    name: 'Kirklees',
    nmdsIdLetter: 'J',
  },
};

describe('/server/services/cssr-records/cssr-record', async () => {
  describe('GetCssrRecordFromPostcode', async () => {
    it('should return a cssr record when a matching postcode with a corresponding cssr entry is found', async () => {
      const stubCompleteMatch = sinon.stub(cssrRecordData, 'getCssrRecordCompleteMatch').callsFake(async () => {
        return la;
      });
      const stubSimilarMatch = sinon.stub(cssrRecordData, 'getCssrRecordWithLikePostcode').callsFake(async () => {
        console.log('This should not be hit');
      });

      const localAuth = await cssrRecord.GetCssrRecordFromPostcode('HD1 1DA');
      expect(localAuth).to.deep.equal(la);
      expect(stubCompleteMatch.calledOnce);
      expect(stubSimilarMatch.notCalled);
    });
  });
});
