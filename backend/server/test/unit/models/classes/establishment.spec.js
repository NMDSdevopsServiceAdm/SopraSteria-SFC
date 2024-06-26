const expect = require('chai').expect;

const Establishment = require('../../../../models/classes/establishment').Establishment;

const establishment = new Establishment();

describe('Establishment Class', () => {
  describe('load()', () => {
    it('should set CQC to null in shareWith if an establishment is not CQC regulated', async () => {
      const nonCqc = {
        isRegulated: false,
        shareWith: { cqc: true, localAuthorities: false },
        locationId: '1-12234556',
      };
      const nonCQCEst = await establishment.load(nonCqc);

      expect(nonCqc.shareWith.cqc).to.equal(null);
      expect(nonCQCEst).to.deep.equal(true);
    });

    it('should not set CQC to null in shareWith if an establishment is CQC regulated', async () => {
      const cqc = { isRegulated: true, shareWith: { cqc: true, localAuthorities: false }, locationId: '1-12234556' };
      const CQCEst = await establishment.load(cqc);

      expect(cqc.shareWith.cqc).to.equal(true);
      expect(CQCEst).to.deep.equal(true);
    });

    it('should return parent name and postcode', async () => {
      const parent = { parentName: 'Parent Est', parentPostcode: 'LE5 1AA' };
      const parentEst = await establishment.load(parent);

      expect(parent.parentName).to.equal('Parent Est');
      expect(parent.parentPostcode).to.equal('LE5 1AA');
      expect(parentEst).to.deep.equal(true);
    });
  });
});
