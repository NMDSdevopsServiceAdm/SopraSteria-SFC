const expect = require('chai').expect;

const Establishment = require('../../../../models/classes/establishment').Establishment;

const establishment = new Establishment();

describe('Establishment Class', () => {
  describe('load()', () => {
    it.skip('should remove local authorities if sharing is disabled', async () => {
      const share = {
        share: {
          enabled: false,
          with: ['Local Authorities'],
        },
        localAuthorities: [{ id: 860, custodianCode: 211, name: 'Kirklees', isPrimaryAuthority: true }],
      };
      const shareEst = await establishment.load(share);
      expect(Array.isArray(share.localAuthorities)).to.deep.equal(true);
      expect(share.localAuthorities.length).to.deep.equal(0);
      expect(shareEst).to.deep.equal(true);
    });
    it.skip('should not remove local authorities if sharing is enabled', async () => {
      const share = {
        share: {
          enabled: true,
          with: ['Local Authority'],
        },
        localAuthorities: [{ id: 860, custodianCode: 211, name: 'Kirklees', isPrimaryAuthority: true }],
      };
      const shareEst = await establishment.load(share);
      expect(Array.isArray(share.localAuthorities)).to.deep.equal(true);
      expect(share.localAuthorities.length).to.deep.equal(1);
      expect(shareEst).to.deep.equal(true);
    });
    it.skip('should remove CQC from sharing with if an establishment is not CQC regulated', async () => {
      const nonCqc = { IsCQCRegulated: false, share: { enabled: true, with: ['CQC'] }, locationId: '1-12234556' };
      const nonCQCEst = await establishment.load(nonCqc);
      expect(Array.isArray(nonCqc.share.with)).to.deep.equal(true);
      expect(nonCqc.share.with.length).to.deep.equal(0);
      expect(nonCqc.locationId).to.equal(null);
      expect(nonCQCEst).to.deep.equal(true);
    });
    it('should not remove CQC from sharing with if an establishment is CQC regulated', async () => {
      const nonCqc = { IsCQCRegulated: true, share: { enabled: true, with: ['CQC'] }, locationId: '1-12234556' };
      const nonCQCEst = await establishment.load(nonCqc);
      expect(Array.isArray(nonCqc.share.with)).to.deep.equal(true);
      expect(nonCqc.share.with.length).to.deep.equal(1);
      expect(nonCqc.locationId).to.equal(nonCqc.locationId);
      expect(nonCQCEst).to.deep.equal(true);
    });
    it('should not remove CQC from sharing with if an establishment is CQC regulated', async () => {
      const nonCqc = { share: { enabled: true, with: ['CQC'] }, locationId: '1-12234556' };
      const nonCQCEst = await establishment.load(nonCqc);
      expect(Array.isArray(nonCqc.share.with)).to.deep.equal(true);
      expect(nonCqc.share.with.length).to.deep.equal(1);
      expect(nonCqc.locationId).to.equal(nonCqc.locationId);
      expect(nonCQCEst).to.deep.equal(true);
    });
  });
});
