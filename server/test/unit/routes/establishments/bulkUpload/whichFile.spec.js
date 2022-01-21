const { isWorkerFile, isTrainingFile } = require('../../../../../routes/establishments/bulkUpload/whichFile');
const expect = require('chai').expect;

describe('whichFile', () => {
  describe('isWorkerFile()', () => {
    it('return true when headings match with CHGUNIQUEWRKID', async () => {
      const header = 'LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DI';
      expect(isWorkerFile(header)).to.deep.equal(true);
    });

    it('return true when headings match without CHGUNIQUEWRKID', async () => {
      const header = 'LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,FLUVAC,';
      expect(isWorkerFile(header)).to.deep.equal(true);
    });

    it("return false when headings don't match", async () => {
      const header = 'NOTATALLWHATWEEXPECT,HOWCOULDYOUUPLOADTHISFILE,';
      expect(isWorkerFile(header)).to.deep.equal(false);
    });
  });

  describe('isTrainingFile()', () => {
    it('return true when headings match start of training headers', async () => {
      const header = 'LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DAT';
      expect(isTrainingFile(header)).to.deep.equal(true);
    });

    it("return false when headings don't match", async () => {
      const header = 'LOCALESTID,UNIQUEWORKERID,CATS,DESCRIPTION,DAT';
      expect(isWorkerFile(header)).to.deep.equal(false);
    });
  });
});
