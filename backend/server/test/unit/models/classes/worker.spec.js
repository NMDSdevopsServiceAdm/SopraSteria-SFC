const expect = require('chai').expect;
const { build, fake, oneOf } = require('@jackfranklin/test-data-bot');
const sinon = require('sinon');

const models = require('../../../../models');
const Worker = require('../../../../models/classes/worker').Worker;
const { Training } = require('../../../../models/classes/training');
const WorkerCertificateService = require('../../../../routes/establishments/workerCertificate/workerCertificateService');
const { WdfCalculator } = require('../../../../models/classes/wdfCalculator');
const { WorkerExceptions } = require('../../../../models/classes/worker');

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
          daysSick: { value: 'Yes', days: fake((f) => f.datatype.number({ min: 1, max: 10 })) },
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
      it("should remove year of entry when country of birth is set to Don't know", async () => {
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
          countryOfBirth: { value: 'Other', other: { country: 'Uganda' } },
        };

        const countryOfBirthWorker = await worker.load(countryOfBirth);

        expect(countryOfBirth.countryOfBirth.value).to.deep.equal('Other');
        expect(countryOfBirth.countryOfBirth.other).to.deep.equal({ country: 'Uganda' });
        expect(countryOfBirth.yearArrived).to.deep.equal(undefined);
        expect(countryOfBirthWorker).to.deep.equal(true);
      });
    });

    describe('Resetting healthAndCareVisa', () => {
      it('should set healthAndCareVisa and employedFromOutsideUk to null when nationality is set to British', async () => {
        const document = {
          nationality: {
            value: 'British',
          },
        };

        await worker.load(document);

        expect(document).to.deep.equal({
          nationality: {
            value: 'British',
          },
          britishCitizenship: null,
          healthAndCareVisa: null,
          employedFromOutsideUk: null,
        });
      });

      it('should set healthAndCareVisa and employedFromOutsideUk to null when britishCitizenship is set to Yes', async () => {
        const document = {
          britishCitizenship: 'Yes',
        };

        await worker.load(document);

        expect(document).to.deep.equal({
          britishCitizenship: 'Yes',
          healthAndCareVisa: null,
          employedFromOutsideUk: null,
        });
      });

      it("should set healthAndCareVisa and employedFromOutsideUk to null when nationality is set to Don't know britishCitizenship is set to Don't know", async () => {
        const document = {
          nationality: {
            value: "Don't know",
          },
          britishCitizenship: "Don't know",
        };

        await worker.load(document);

        expect(document).to.deep.equal({
          nationality: {
            value: "Don't know",
          },
          britishCitizenship: "Don't know",
          healthAndCareVisa: null,
          employedFromOutsideUk: null,
        });
      });
    });

    describe('Resetting employedFromOutsideUk', () => {
      it('should set employedFromOutsideUk to null when healthAndCareVisa set to No', async () => {
        const document = {
          healthAndCareVisa: 'No',
        };

        await worker.load(document);

        expect(document).to.deep.equal({ healthAndCareVisa: 'No', employedFromOutsideUk: null });
      });

      it("should set employedFromOutsideUk to null when healthAndCareVisa set to Don't know'", async () => {
        const document = {
          healthAndCareVisa: "Don't know",
        };

        await worker.load(document);

        expect(document).to.deep.equal({ healthAndCareVisa: "Don't know", employedFromOutsideUk: null });
      });

      it("should not set employedFromOutsideUk when healthAndCareVisa set to Yes'", async () => {
        const document = {
          healthAndCareVisa: 'Yes',
        };

        await worker.load(document);

        expect(document).to.deep.equal({ healthAndCareVisa: 'Yes' });
      });
    });
  });

  describe('archive()', () => {
    const worker = new Worker();
    worker._uid = 'mock-worker-uid';

    const mockSequelizeReturnValue = [
      1,
      [
        {
          ID: 'mock-id',
          updated: 'mock-updated-date',
          get: () => {
            return this;
          },
        },
      ],
    ];
    const mockTransaction = { rollback: sinon.spy() };

    beforeEach(() => {
      sinon.stub(worker, 'deleteAllTrainingCertificatesAssociatedWithWorker');
      sinon.stub(worker, 'deleteAllQualificationCertificatesAssociatedWithWorker');
      sinon.stub(models.workerAudit, 'bulkCreate');
      sinon.stub(WdfCalculator, 'calculate');
    });

    it('should update the worker record in database with archived: true', async () => {
      sinon.stub(models.worker, 'update').resolves(mockSequelizeReturnValue);

      await worker.archive('admin', mockTransaction);

      expect(models.worker.update).to.have.been.calledWith(
        sinon.match({ archived: true }),
        sinon.match({
          transaction: mockTransaction,
          where: { uid: 'mock-worker-uid' },
        }),
      );
    });

    it('should trigger the deletion of assciated certificates', async () => {
      sinon.stub(models.worker, 'update').resolves(mockSequelizeReturnValue);

      await worker.archive('admin', mockTransaction);

      expect(worker.deleteAllTrainingCertificatesAssociatedWithWorker).to.have.been.called;
      expect(worker.deleteAllQualificationCertificatesAssociatedWithWorker).to.have.been.called;
    });

    it('should remove the personal data of the worker from database', async () => {
      const expectedFieldsToRemove = [
        'NameOrIdValue',
        'DateOfBirthValue',
        'NationalInsuranceNumberValue',
        'PostcodeValue',
        'GenderValue',
        'DisabilityValue',
        'EthnicityFkValue',
        'NationalityValue',
        'NationalityOtherFK',
        'BritishCitizenshipValue',
        'CountryOfBirthValue',
        'CountryOfBirthOtherFK',
        'YearArrivedValue',
        'YearArrivedYear',
        'HealthAndCareVisaValue',
      ];

      sinon.stub(models.worker, 'update').resolves(mockSequelizeReturnValue);

      await worker.archive('admin', mockTransaction);

      const updates = models.worker.update.getCall(0).args[0];

      // use empty string for NameOrIdValue as the column has non-nullable requirement
      expect(updates).to.haveOwnProperty(expectedFieldsToRemove[0], '');

      expectedFieldsToRemove.slice(1).forEach((fieldName) => {
        expect(updates).to.haveOwnProperty(fieldName, null);
      });
    });

    it('should throw an error if failed to find the worker', async () => {
      sinon.stub(models.worker, 'update').resolves([0, []]);
      sinon.stub(console, 'error');

      let error;
      try {
        await worker.archive('admin', mockTransaction);
      } catch (thrownError) {
        error = thrownError;
      }

      expect(error).to.be.instanceof(WorkerExceptions.WorkerDeleteException);
    });

    it('should throw an error on database error', async () => {
      sinon.stub(console, 'error');
      sinon.stub(models.worker, 'update').rejects(new Error('some database error'));

      let error;
      try {
        await worker.archive('admin', mockTransaction);
      } catch (thrownError) {
        error = thrownError;
      }

      expect(error).to.be.instanceof(WorkerExceptions.WorkerDeleteException);
    });
  });

  describe('setWdfProperties()', () => {
    it('should set wdfEligible inside the document if true', async () => {
      sinon.stub(worker, 'isWdfEligible').callsFake(() => {
        return { isEligible: true };
      });
      const document = {};

      await worker.setWdfProperties(document, '', 'test');
      expect(document.wdfEligible).to.deep.equal(true);
    });

    it('should set wdfEligible inside the document if false', async () => {
      sinon.stub(worker, 'isWdfEligible').callsFake(() => {
        return { isEligible: false };
      });
      const document = {};

      await worker.setWdfProperties(document, '', 'test');
      expect(document.wdfEligible).to.deep.equal(false);
    });

    it('should set lastWdfEligibility inside the document if currently eligible and last eligiblity date is before effective date', async () => {
      sinon.stub(worker, 'isWdfEligible').callsFake(() => {
        return { isEligible: true };
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
        return { isEligible: true };
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

  describe('deleteAllTrainingCertificatesAssociatedWithWorker()', async () => {
    let mockWorker;
    let stubs;
    const trainingCertificatesReturnedFromDb = () => {
      return [
        { uid: 'abc123', key: 'abc123/trainingCertificate/dasdsa12312' },
        { uid: 'def456', key: 'def456/trainingCertificate/deass12092' },
        { uid: 'ghi789', key: 'ghi789/trainingCertificate/da1412342' },
      ];
    };

    beforeEach(() => {
      mockWorker = new Worker();
      mockWorker._id = 12345;
      stubs = {
        getWorkerCertificateServiceInstance: sinon
          .stub(WorkerCertificateService, 'initialiseTraining')
          .returns(new WorkerCertificateService()),
        deleteAllCertificates: sinon.stub(WorkerCertificateService.prototype, 'deleteAllCertificates'),
        getTrainingCertificates: sinon
          .stub(models.trainingCertificates, 'getAllCertificateRecordsForWorker')
          .resolves(trainingCertificatesReturnedFromDb),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should call deleteAllCertificates on WorkerCertificateService', async () => {
      const transaction = {};
      await mockWorker.deleteAllTrainingCertificatesAssociatedWithWorker(transaction);

      expect(stubs.getWorkerCertificateServiceInstance).to.have.been.called;
      expect(stubs.deleteAllCertificates).to.be.calledWith(12345);
    });
  });

  describe('deleteAllQualificationsCertificatesAssociatedWithWorker()', async () => {
    let mockWorker;
    let stubs;
    const qualificationCertificatesReturnedFromDb = () => {
      return [
        { uid: 'abc123', key: 'abc123/qualificationCertificate/dasdsa12312' },
        { uid: 'def456', key: 'def456/qualificationCertificate/deass12092' },
        { uid: 'ghi789', key: 'ghi789/qualificationCertificate/da1412342' },
      ];
    };

    beforeEach(() => {
      mockWorker = new Worker();
      mockWorker._id = 12345;
      stubs = {
        getWorkerCertificateServiceInstance: sinon
          .stub(WorkerCertificateService, 'initialiseQualifications')
          .returns(new WorkerCertificateService()),
        deleteAllCertificates: sinon.stub(WorkerCertificateService.prototype, 'deleteAllCertificates'),
        getQualificationCertificates: sinon
          .stub(models.qualificationCertificates, 'getAllCertificateRecordsForWorker')
          .resolves(qualificationCertificatesReturnedFromDb),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should call deleteAllCertificates on WorkerCertificateService', async () => {
      const transaction = {};
      await mockWorker.deleteAllQualificationCertificatesAssociatedWithWorker(transaction);

      expect(stubs.getWorkerCertificateServiceInstance).to.have.been.called;
      expect(stubs.deleteAllCertificates).to.be.calledWith(12345);
    });
  });

  describe('saveAssociatedEntities', async () => {
    let mockWorker;

    beforeEach(() => {
      mockWorker = new Worker();
      mockWorker._id = 12345;
      mockWorker._uid = 'ba1260d8-1791-484c-ac92-c1da2a96dabb';
    });

    it('should delete certificates, destroy all training records in database and save new records when training records in trainingEntities', async () => {
      const savedBy = 'mockUser';
      const bulkUploaded = false;
      const transaction = {};

      const deleteCertificatesSpy = sinon.stub(mockWorker, 'deleteAllTrainingCertificatesAssociatedWithWorker');
      const trainingDestroySpy = sinon.stub(models.workerTraining, 'destroy').resolves(true);
      const training = new Training(123, mockWorker._uid);

      const trainingSaveSpy = sinon.stub(training, 'save').resolves(true);

      mockWorker.associateTraining(training);

      await mockWorker.saveAssociatedEntities(savedBy, bulkUploaded, transaction);

      expect(deleteCertificatesSpy).to.have.been.calledWith(transaction);
      expect(trainingDestroySpy).to.have.been.calledWith({
        where: { workerFk: mockWorker._id },
        transaction: transaction,
      });
      expect(trainingSaveSpy).to.have.been.calledWith(savedBy, bulkUploaded, transaction);
    });

    it('should not make calls to delete certificates or destroy training records when no training records in trainingEntities', async () => {
      const deleteCertificatesSpy = sinon.stub(mockWorker, 'deleteAllTrainingCertificatesAssociatedWithWorker');
      const trainingDestroySpy = sinon.stub(models.workerTraining, 'destroy').resolves(true);

      const transaction = {};

      await mockWorker.saveAssociatedEntities('mockUser', false, transaction);

      expect(deleteCertificatesSpy).not.to.have.been.called;
      expect(trainingDestroySpy).to.not.have.been.called;
    });
  });

  describe('patchPropertyValue', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should update the value of a managed property', async () => {
      const mockWorker = new Worker();
      mockWorker.load({ carryOutDelegatedHealthcareActivities: 'Yes' });

      expect(mockWorker.carryOutDelegatedHealthcareActivities).to.deep.equal('Yes');

      mockWorker.patchPropertyValue('CarryOutDelegatedHealthcareActivities', 'No');
      expect(mockWorker.carryOutDelegatedHealthcareActivities).to.deep.equal('No');
    });

    it('should log an error if given property name is invalid', async () => {
      const mockWorker = new Worker();
      sinon.stub(console, 'error');

      mockWorker.patchPropertyValue('SomeNonExistProperty', 'No');

      expect(console.error).to.have.been.calledWith('failed to patch non existing property: "SomeNonExistProperty"');
    });
  });
});
