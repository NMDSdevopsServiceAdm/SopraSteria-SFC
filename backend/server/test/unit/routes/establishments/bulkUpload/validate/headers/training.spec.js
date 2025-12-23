const {
  validateTrainingHeaders,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/headers/training');
const { trainingHeadersAsArray } = require('../../../../../mockdata/training');
const expect = require('chai').expect;

const trainingHeaders = trainingHeadersAsArray.join(',');

describe('server/routes/establishments/bulkUpload/validate/headers/training', () => {
  describe('validateTrainingHeaders()', () => {
    it('should return true when headings match', async () => {
      expect(validateTrainingHeaders(trainingHeaders)).to.deep.equal(true);
    });

    it('should return false when header (CATEGORY) missing', async () => {
      const invalidHeaders = trainingHeaders.replace('CATEGORY', '');

      expect(validateTrainingHeaders(invalidHeaders)).to.deep.equal(false);
    });
  });
});
