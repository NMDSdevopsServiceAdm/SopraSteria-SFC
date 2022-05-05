const {
  isWorkerFile,
  isTrainingFile,
  getFileType,
} = require('../../../../../routes/establishments/bulkUpload/whichFile');
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

  describe('getFileType', () => {
    it('should return the correct file type for establishments', () => {
      const fileType = getFileType('LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRES');

      expect(fileType).to.deep.equal('WorkplaceCSVValidator');
    });

    it('should return the correct file type for workers', () => {
      const fileType = getFileType('LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,FLUVAC,');

      expect(fileType).to.deep.equal('Worker');
    });

    it('should return the correct file type for workers if CHGUNIQUEWRKID column present', () => {
      const fileType = getFileType('LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DI');

      expect(fileType).to.deep.equal('Worker');
    });

    it('should return the correct file type for training', () => {
      const fileType = getFileType('LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DAT');

      expect(fileType).to.deep.equal('Training');
    });

    it('should return null if not valid file', () => {
      const fileType = getFileType('LOCALESTID,UNIQATEGORY,DESCRIPTION,DAT');

      expect(fileType).to.deep.equal(null);
    });
  });
});
