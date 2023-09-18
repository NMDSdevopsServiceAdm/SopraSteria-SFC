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
  });

  describe('getLocalAuthority(postcode)', () => {
    it('should obtain the correct cssr record for the supplied postcode', async () => {
      let cssrResult = await establishment.getLocalAuthority('BL2 2QX');
      expect(cssrResult.theAuthority.id).to.equal(304);

      cssrResult = await establishment.getLocalAuthority('SR2 7TZ');
      expect(cssrResult.theAuthority.id).to.equal(110);

      cssrResult = await establishment.getLocalAuthority('SR2 XXX');
      expect(cssrResult).to.equal(null); // or exception
    });
  });
});
