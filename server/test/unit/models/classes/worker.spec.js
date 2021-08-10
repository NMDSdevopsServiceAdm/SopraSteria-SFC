const expect = require('chai').expect;
const { build, fake, oneOf } = require('@jackfranklin/test-data-bot');
const sinon = require('sinon');

const Worker = require('../../../../models/classes/worker').Worker;
const WdfCalculator = require('../../../../models/classes/wdfCalculator')

const worker = new Worker();

describe('Worker Class', () => {

  afterEach(() => {
    sinon.restore();
  });

  describe('load()', () => {
    it('should remove nurse specialism and registered nurse when not a registered nurse', async () => {
      const notRegisteredNurse = {
        mainJob: {
          jobId: 27,
        },
      };
      const nonRegisteredNurseWorker = await worker.load(notRegisteredNurse);
      expect(notRegisteredNurse.nurseSpecialisms.value).to.deep.equal(null);
      expect(notRegisteredNurse.nurseSpecialisms.specialisms).to.deep.equal(null);
      expect(notRegisteredNurse.registeredNurse).to.deep.equal(null);
      expect(nonRegisteredNurseWorker).to.deep.equal(true);
    });
    it('should not remove nurse specialism and registered nurse when a registered nurse', async () => {
      const registeredNurse = {
        mainJob: {
          jobId: 23,
        },
        nurseSpecialisms: {
          value: 'Yes',
          specialisms: [{ specialism: 'Adults' }],
        },
        registeredNurse: 'Adult Nurse',
      };
      const registeredNurseWorker = await worker.load(registeredNurse);
      expect(registeredNurse.nurseSpecialisms.value).to.deep.equal('Yes');
      expect(registeredNurse.nurseSpecialisms.specialisms).to.deep.equal([{ specialism: 'Adults' }]);
      expect(registeredNurse.registeredNurse).to.deep.equal('Adult Nurse');
      expect(registeredNurseWorker).to.deep.equal(true);
    });
    it('should remove AMHP when not a social worker', async () => {
      const nonSocialWorker = {
        mainJob: {
          jobId: 23,
        },
      };
      const nonSocialWorkerWorker = await worker.load(nonSocialWorker);
      expect(nonSocialWorker.approvedMentalHealthWorker).to.deep.equal(null);
      expect(nonSocialWorkerWorker).to.deep.equal(true);
    });
    it('should not remove AMHP when a social worker', async () => {
      const nonSocialWorker = {
        mainJob: {
          jobId: 27,
        },
        approvedMentalHealthWorker: 'Yes',
      };
      const nonSocialWorkerWorker = await worker.load(nonSocialWorker);
      expect(nonSocialWorker.approvedMentalHealthWorker).to.deep.equal('Yes');
      expect(nonSocialWorkerWorker).to.deep.equal(true);
    });
    it('should remove British citizenship when nationality is British', async () => {
      const british = {
        nationality: {
          value: 'British',
          other: {},
        },
      };
      const britishWorker = await worker.load(british);
      expect(british.britishCitizenship).to.deep.equal(null);
      expect(british.nationality.other).to.deep.equal(undefined);
      expect(britishWorker).to.deep.equal(true);
    });
    it('should not remove British citizenship when nationality is not British', async () => {
      const nonbritish = {
        nationality: {
          value: 'Other',
          other: {
            nationalityId: 56,
            nationality: 'Danish',
          },
        },
        britishCitizenship: 'Yes',
      };
      const nonBritishWorker = await worker.load(nonbritish);
      expect(nonbritish.britishCitizenship).to.deep.equal('Yes');
      expect(nonBritishWorker).to.deep.equal(true);
    });
    it('should remove year arrived when born in the UK', async () => {
      const bornUk = {
        countryOfBirth: {
          value: 'United Kingdom',
        },
      };
      const bornUkWorker = await worker.load(bornUk);
      expect(bornUk.yearArrived.value).to.deep.equal(null);
      expect(bornUk.yearArrived.year).to.deep.equal(null);
      expect(bornUkWorker).to.deep.equal(true);
    });
    it('should not remove year arrived when not born in the UK', async () => {
      const notBornUk = {
        countryOfBirth: {
          value: 'Other',
          other: {
            countryId: 59,
            country: 'Denmark',
          },
        },
        yearArrived: {
          value: 'Yes',
          year: 2009,
        },
      };
      const notBornUkWorker = await worker.load(notBornUk);
      expect(notBornUk.yearArrived.value).to.deep.equal('Yes');
      expect(notBornUk.yearArrived.year).to.deep.equal(2009);
      expect(notBornUkWorker).to.deep.equal(true);
    });
    it('should remove contracted hours when on a zero hour contract', async () => {
      const zeroHours = {
        zeroHoursContract: 'Yes',
      };
      const zeroHoursWorker = await worker.load(zeroHours);
      expect(zeroHours.weeklyHoursContracted.value).to.deep.equal(null);
      expect(zeroHours.weeklyHoursContracted.hours).to.deep.equal(null);
      expect(zeroHoursWorker).to.deep.equal(true);
    });
    it('should remove contracted hours when from an agency', async () => {
      const agency = {
        contract: 'Agency',
      };
      const agencyWorker = await worker.load(agency);
      expect(agency.weeklyHoursContracted.value).to.deep.equal(null);
      expect(agency.weeklyHoursContracted.hours).to.deep.equal(null);
      expect(agencyWorker).to.deep.equal(true);
    });
    it('should not remove contracted hours when not on a zero hour contract', async () => {
      const notZeroHours = {
        zeroHoursContract: 'No',
        weeklyHoursContracted: {
          value: 'Yes',
          hours: 37,
        },
      };
      const notZeroHoursWorker = await worker.load(notZeroHours);
      expect(notZeroHours.weeklyHoursContracted.value).to.deep.equal('Yes');
      expect(notZeroHours.weeklyHoursContracted.hours).to.deep.equal(37);
      expect(notZeroHoursWorker).to.deep.equal(true);
    });
    it('should not remove contracted hours when not from an agency', async () => {
      const notZeroHours = {
        contract: 'Permanent',
        weeklyHoursContracted: {
          value: 'Yes',
          hours: 37,
        },
      };
      const notZeroHoursWorker = await worker.load(notZeroHours);
      expect(notZeroHours.weeklyHoursContracted.value).to.deep.equal('Yes');
      expect(notZeroHours.weeklyHoursContracted.hours).to.deep.equal(37);
      expect(notZeroHoursWorker).to.deep.equal(true);
    });
    it('should remove average hours when not on a zero hour contract', async () => {
      const notZeroHours = {
        zeroHoursContract: 'No',
      };
      const notZeroHoursWorker = await worker.load(notZeroHours);
      expect(notZeroHours.weeklyHoursAverage.value).to.deep.equal(null);
      expect(notZeroHours.weeklyHoursAverage.hours).to.deep.equal(null);
      expect(notZeroHoursWorker).to.deep.equal(true);
    });
    it('should not remove average hours when on a zero hour contract', async () => {
      const zeroHours = {
        zeroHoursContract: 'Yes',
        weeklyHoursAverage: {
          value: 'Yes',
          hours: 37,
        },
      };
      const zeroHoursWorker = await worker.load(zeroHours);
      expect(zeroHours.weeklyHoursAverage.value).to.deep.equal('Yes');
      expect(zeroHours.weeklyHoursAverage.hours).to.deep.equal(37);
      expect(zeroHoursWorker).to.deep.equal(true);
    });
    it('should remove sickness when contract is agency or pool/bank', async () => {
      const agencyBuilder = build({
        fields: {
          contract: oneOf('Agency', 'Pool/Bank'),
          daysSick: { value: 'Yes', days: fake((f) => f.random.number({ min: 1, max: 10 })) },
        },
      });
      const agency = agencyBuilder();
      const agencyWorker = await worker.load(agency);
      expect(agency.daysSick.value).to.deep.equal(null);
      expect(agency.daysSick.days).to.deep.equal(null);
      expect(agencyWorker).to.deep.equal(true);
    });
    it('should remove highest social care qualification when they do not have one', async () => {
      const nonSocialQual = {
        qualificationInSocialCare: 'No',
      };
      const nonSocialQualWorker = await worker.load(nonSocialQual);
      expect(nonSocialQual.socialCareQualification.qualificationId).to.deep.equal(null);
      expect(nonSocialQual.socialCareQualification.title).to.deep.equal(null);
      expect(nonSocialQualWorker).to.deep.equal(true);
    });
    it('should not highest social care qualification when they do have one', async () => {
      const socialQual = {
        qualificationInSocialCare: 'Yes',
        socialCareQualification: {
          qualificationId: 8,
          title: 'Level 7',
        },
      };
      const socialQualWorker = await worker.load(socialQual);
      expect(socialQual.socialCareQualification.qualificationId).to.deep.equal(8);
      expect(socialQual.socialCareQualification.title).to.deep.equal('Level 7');
      expect(socialQualWorker).to.deep.equal(true);
    });
    it('should remove highest non-social care qualification when they do not have one', async () => {
      const nonQual = {
        otherQualification: 'No',
      };
      const nonQualWorker = await worker.load(nonQual);
      expect(nonQual.highestQualification.qualificationId).to.deep.equal(null);
      expect(nonQual.highestQualification.title).to.deep.equal(null);
      expect(nonQualWorker).to.deep.equal(true);
    });
    it('should not highest non-social care qualification when they do have one', async () => {
      const qual = {
        otherQualification: 'Yes',
        highestQualification: {
          qualificationId: 8,
          title: 'Level 7',
        },
      };
      const qualWorker = await worker.load(qual);
      expect(qual.highestQualification.qualificationId).to.deep.equal(8);
      expect(qual.highestQualification.title).to.deep.equal('Level 7');
      expect(qualWorker).to.deep.equal(true);
    });

    describe('Resetting yearArrived', () => {
      it('should remove year of entry when country of birth is set to Don\'t know', async () => {
        const countryOfBirth = {
          countryOfBirth: { value: `Don't know` },
        };

        const countryOfBirthWorker = await worker.load(countryOfBirth);

        expect(countryOfBirth.countryOfBirth.value).to.deep.equal(`Don't know`);
        expect(countryOfBirth.yearArrived).to.deep.equal({ value: null, year: null });
        expect(countryOfBirthWorker).to.deep.equal(true);
      });

      it('should remove year of entry when country of birth is set to United Kingdom', async () => {
        const countryOfBirth = {
          countryOfBirth: { value: 'United Kingdom' },
        };

        const countryOfBirthWorker = await worker.load(countryOfBirth);

        expect(countryOfBirth.countryOfBirth.value).to.deep.equal('United Kingdom');
        expect(countryOfBirth.yearArrived).to.deep.equal({ value: null, year: null });
        expect(countryOfBirthWorker).to.deep.equal(true);
      });

      it('should not change the year of entry when country of birth is set to Other', async () => {
        const countryOfBirth = {
          countryOfBirth: { value: 'Other', other: { country: 'Uganda' }}
        };

        const countryOfBirthWorker = await worker.load(countryOfBirth);

        expect(countryOfBirth.countryOfBirth.value).to.deep.equal('Other');
        expect(countryOfBirth.countryOfBirth.other).to.deep.equal({ country: 'Uganda' });
        expect(countryOfBirth.yearArrived).to.deep.equal(undefined);
        expect(countryOfBirthWorker).to.deep.equal(true);
      });
    });
  });

  describe('setWdfProperties()', async () => {
    it('should set wdfEligible inside the document if true', async () => {
      sinon.stub(worker, 'isWdfEligible').callsFake(() => {
        return { isEligible: true }
      });
      const document = {};

      await worker.setWdfProperties(document, '', 'test');
      expect(document.wdfEligible).to.deep.equal(true);
    });

    it('should set wdfEligible inside the document if false', async () => {
      sinon.stub(worker, 'isWdfEligible').callsFake(() => {
        return { isEligible: false }
      });
      const document = {};

      await worker.setWdfProperties(document, '', 'test');
      expect(document.wdfEligible).to.deep.equal(false);
    });

    it('should set lastWdfEligibility inside the document if currently eligible and last eligiblity date is before effective date', async () => {
      sinon.stub(worker, 'isWdfEligible').callsFake(() => {
        return { isEligible: true }
      });

      worker._lastWdfEligibility = new Date('2021-03-01');

      const document = {};
      const updatedTimestamp = new Date();
      const wdfAudit = await worker.setWdfProperties(document, updatedTimestamp, 'test');

      expect(document.lastWdfEligibility).to.deep.equal(updatedTimestamp);
      expect(wdfAudit).to.deep.equal({
        username: 'test',
        type: 'wdfEligible',
      });
    });

    it('should set lastWdfEligibility inside the document if currently eligible and last eligiblity date is null', async () => {
      sinon.stub(worker, 'isWdfEligible').callsFake(() => {
        return { isEligible: true }
      });

      worker._lastWdfEligibility = null;

      const document = {};
      const updatedTimestamp = new Date();
      const wdfAudit = await worker.setWdfProperties(document, updatedTimestamp, 'test');

      expect(document.lastWdfEligibility).to.deep.equal(updatedTimestamp);
      expect(wdfAudit).to.deep.equal({
        username: 'test',
        type: 'wdfEligible',
      });
    });
  });
});
