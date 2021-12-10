const expect = require('chai').expect;
const {
  getMetadata,
  isNotMetadata,
} = require('../../../../../../routes/establishments/bulkUpload/validate/validatePut');

describe('validatePut', () => {
  describe('getMetadata', () => {
    const file = { filename: 'file1', username: 'testuser' };

    it('should return metadata object with filename and userName set to data passed in', async () => {
      const returnedMetadata = getMetadata(file, 'Establishment');

      expect(returnedMetadata.filename).to.equal(file.filename);
      expect(returnedMetadata.userName).to.equal(file.username);
    });

    it('should return metadata object with fileType set to type passed in', async () => {
      const returnedMetadata = getMetadata(file, 'Establishment');

      expect(returnedMetadata.fileType).to.equal('Establishment');
    });

    it('should return metadata object with other fields set to null', async () => {
      const returnedMetadata = getMetadata(file, 'Establishment');

      expect(returnedMetadata.id).to.equal(null);
      expect(returnedMetadata.warnings).to.equal(null);
      expect(returnedMetadata.errors).to.equal(null);
      expect(returnedMetadata.records).to.equal(null);
      expect(returnedMetadata.deleted).to.equal(null);
    });
  });

  describe('isNotMetadata', () => {
    it('should return true when file key does not include metadata.json', async () => {
      const notMetadata = isNotMetadata('2354/latest/test-workplace.csv');

      expect(notMetadata).to.be.true;
    });

    it('should return false when file key does include metadata.json', async () => {
      const notMetadata = isNotMetadata('2354/latest/test-workplace.csv.metadata.json');

      expect(notMetadata).to.be.false;
    });
  });
});
