const expect = require('chai').expect;

const Establishment = require('../../../../models/classes/establishment').Establishment;

const establishment = new Establishment();

describe('Establishment Class', () => {
  describe('load()', () => {
    it('should remove local authorities if sharing is disabled', async () => {
      const share = {
        share: {
          enabled: false,
          with: ['Local Authorities']
        },
        localAuthorities: [{ id: 860, custodianCode: 211, name: 'Kirklees', isPrimaryAuthority: true }]
      };
      const shareEst = await establishment.load(share);
      expect(Array.isArray(share.localAuthorities)).to.deep.equal(true);
      expect(share.localAuthorities.length).to.deep.equal(0);
      expect(shareEst).to.deep.equal(true);
    });
    it('should not remove local authorities if sharing is enabled', async () => {
      const share = {
        share: {
          enabled: true,
          with: ['Local Authority']
        },
        localAuthorities: [{ id: 860, custodianCode: 211, name: 'Kirklees', isPrimaryAuthority: true }]
      };
      const shareEst = await establishment.load(share);
      expect(Array.isArray(share.localAuthorities)).to.deep.equal(true);
      expect(share.localAuthorities.length).to.deep.equal(1);
      expect(shareEst).to.deep.equal(true);
    });
    it('should remove CQC from sharing with if an establishment is not CQC regulated', async () => {
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
    it('should remove capacity and utilisation when my main service is non-care', async () => {
      const nonCare = {
        mainService: {
          id: 16,
          name: 'Head office services'
        },
        capacities: [{
          question: 'How many places do you currently have?',
          questionId: 8,
          seq: 1
        },
        {
          question: 'Number of people using the service on the completion date',
          questionId: 9,
          seq: 2
        }]
      };
      const nonCareEst = await establishment.load(nonCare);
      expect(Array.isArray(nonCare.capacities)).to.deep.equal(true);
      expect(nonCare.capacities.length).to.deep.equal(0);
      expect(nonCareEst).to.deep.equal(true);
    });
    it('should not remove capacity and utilisation when my main service is care', async () => {
      const nonCare = {
        mainService: {
          id: 9,
          name: 'Day care and day services'
        },
        capacities: [{
          question: 'How many places do you currently have?',
          questionId: 8,
          seq: 1,
          answer: 65
        },
        {
          question: 'Number of people using the service on the completion date',
          questionId: 9,
          seq: 2,
          answer: 60
        }]
      };
      const nonCareEst = await establishment.load(nonCare);
      expect(Array.isArray(nonCare.capacities)).to.deep.equal(true);
      expect(nonCare.capacities.length).to.deep.equal(2);
      expect(nonCareEst).to.deep.equal(true);
    });
  });
});
