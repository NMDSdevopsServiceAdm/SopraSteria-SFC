const {
  validateTrainingHeaders,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/headers/training');
const expect = require('chai').expect;

const trainingHeaders = 'LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DATECOMPLETED,EXPIRYDATE,ACCREDITED,NOTES';

describe('server/routes/establishments/bulkUpload/validate/headers/training', () => {
  describe('validateTrainingHeaders()', () => {
    it('should return true when headings match', async () => {
      expect(await validateTrainingHeaders(trainingHeaders)).to.deep.equal(true);
    });

    it('should return false when header (CATEGORY) missing', async () => {
      const invalidHeaders = trainingHeaders.replace('CATEGORY', '');

      expect(await validateTrainingHeaders(invalidHeaders)).to.deep.equal(false);
    });
  });
});
