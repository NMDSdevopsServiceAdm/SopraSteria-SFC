const expect = require('chai').expect;
const sinon = require('sinon');

const cssrRecord = require('../../../../services/cssr-records/cssr-record');

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
      sinon.stub(cssrRecord, 'getCssrRecordCompleteMatch').callsFake(async (args) => {
        return { postcode: args.where.postcode, ...la };
      });
      // let spy = sinon.spy(cssrRecord);

      const localAuth = await cssrRecord.GetCssrRecordFromPostcode('HD1 1DA');
      expect(localAuth).to.deep.equal(la.theAuthority.name);
      expect(sinon.getCssrRecordCompleteMatch.calledOnce);
    });
  });
});
