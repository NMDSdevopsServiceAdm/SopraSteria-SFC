const {
  validateTrainingHeaders,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/headers/training');
const { trainingHeaders } = require('../../../../../mockdata/training');
const expect = require('chai').expect;

const trainingHeadersAsString = trainingHeaders.join(',');

describe.only('server/routes/establishments/bulkUpload/validate/headers/training', () => {
  describe('validateTrainingHeaders()', () => {
    it('should return true when headings match', async () => {
      expect(validateTrainingHeaders(trainingHeadersAsString)).to.deep.equal(true);
    });

    it('should return false when header (CATEGORY) missing', async () => {
      const invalidHeaders = trainingHeadersAsString.replace('CATEGORY', '');

      expect(validateTrainingHeaders(invalidHeaders)).to.deep.equal(false);
    });
  });
});
