const expect = require('chai').expect;
const { BUDI } = require('../../../classes/BUDI');

describe('BUDI class', () => {
  describe('trainingProvider()', () => {
    const mockMappings = {
      TRAINING_PROVIDER: [
        { ASC: 1, BUDI: 1 },
        { ASC: 2, BUDI: 2 },
        { ASC: 63, BUDI: 999 }, // others
      ],
    };

    it('should convert trainingProvider value from bulk upload code to database ID', async () => {
      const budi = new BUDI(mockMappings);

      expect(budi.trainingProvider(budi.TO_ASC, 1)).to.deep.equal(1);
      expect(budi.trainingProvider(budi.TO_ASC, 2)).to.deep.equal(2);
      expect(budi.trainingProvider(budi.TO_ASC, 999)).to.deep.equal(63);
    });

    it('should convert trainingProvider value from database ID to bulk upload code', async () => {
      const budi = new BUDI(mockMappings);

      expect(budi.trainingProvider(budi.FROM_ASC, 1)).to.deep.equal(1);
      expect(budi.trainingProvider(budi.FROM_ASC, 2)).to.deep.equal(2);
      expect(budi.trainingProvider(budi.FROM_ASC, 63)).to.deep.equal(999);
    });

    it('should convert null or invalid values to null', async () => {
      const budi = new BUDI(mockMappings);

      expect(budi.trainingProvider(budi.FROM_ASC, null)).to.deep.equal(null);
      expect(budi.trainingProvider(budi.TO_ASC, null)).to.deep.equal(null);

      expect(budi.trainingProvider(budi.FROM_ASC, undefined)).to.deep.equal(null);
      expect(budi.trainingProvider(budi.TO_ASC, undefined)).to.deep.equal(null);

      expect(budi.trainingProvider(budi.TO_ASC, NaN)).to.deep.equal(null);
      expect(budi.trainingProvider(budi.TO_ASC, '')).to.deep.equal(null);
    });
  });
});
