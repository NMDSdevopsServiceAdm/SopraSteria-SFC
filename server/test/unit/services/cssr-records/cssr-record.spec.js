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
  afterEach(() => {
    sinon.restore();
  });

  describe('GetCssrRecordFromPostcode', async () => {
    it('should return a cssr record when a matching postcode with a corresponding cssr entry is found', async () => {
      const stubCompleteMatch = sinon.stub(cssrRecordData, 'getCssrRecordCompleteMatch').callsFake(async () => {
        return la;
      });
      const stubPartialMatch = sinon.stub(cssrRecordData, 'getCssrRecordWithLikePostcode').callsFake(async () => {
        console.log('This should not be hit');
      });

      const localAuth = await cssrRecord.GetCssrRecordFromPostcode('HD1 1DA');
      expect(localAuth).to.deep.equal(la);
      expect(stubCompleteMatch.calledOnce);
      expect(stubCompleteMatch.withArgs('HD1 1DA'));
      expect(stubPartialMatch.notCalled);
    });

    describe('when no exact match is found', async () => {
      let stubCompleteMatch;
      beforeEach(() => {
        stubCompleteMatch = sinon.stub(cssrRecordData, 'getCssrRecordCompleteMatch').callsFake(async () => {
          return null;
        });
      });

      it('should attempt to find a cssr corresponding to similar postcodes', async () => {
        const stubPartialMatch = sinon.stub(cssrRecordData, 'getCssrRecordWithLikePostcode').callsFake(async () => {
          return null;
        });

        await cssrRecord.GetCssrRecordFromPostcode('HD1 1DA');
        expect(stubCompleteMatch.calledOnce);
        expect(stubPartialMatch.calledThrice);
        expect(stubPartialMatch.calledWith('HD1 1D'));
        expect(stubPartialMatch.calledWith('HD1 1'));
        expect(stubPartialMatch.calledWith('HD1'));
      });
    });
  });
});
