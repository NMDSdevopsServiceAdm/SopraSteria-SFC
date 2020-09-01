const expect = require('chai').expect;
const workers = require('../../../mockdata/workers').data;
const establishmentId = require('../../../mockdata/workers').establishmentId;
const apprenticeshipTypes = require('../../../mockdata/workers').apprenticeshipTypes;
const maxquals = require('../../../mockdata/workers').maxquals;
const knownHeaders = require('../../../mockdata/workers').knownHeaders;
const moment = require('moment');
const filename = 'server/models/BulkImport/csv/workers.js';
const sinon = require('sinon');
const dbmodels = require('../../../../../models');
sinon.stub(dbmodels.status, 'ready').value(false);
const BUDI = require('../../../../../models/BulkImport/BUDI').BUDI;
const WorkerCsvValidator = require('../../../../../models/BulkImport/csv/workers').Worker;
const testUtils = require('../../../../../utils/testUtils');
const csv = require('csvtojson');
const { build } = require('@jackfranklin/test-data-bot');

const BUDI_TO_ASC = 100;

function mapCsvToWorker(worker, headers) {
  const mapped = {};
  headers.forEach((header, index) => {
    mapped[header] = worker[index];
  });
  return mapped;
}

const buildWorkerCsv = build('WorkerCSV', {
  fields: {
    AMHP: "",
    APPRENTICE: "2",
    AVGHOURS: "",
    BRITISHCITIZENSHIP: "",
    CARECERT: "3",
    CONTHOURS: "23",
    COUNTRYOFBIRTH: "826",
    DAYSSICK: "1",
    DISABLED: "0",
    DISPLAYID: "Aaron Russell",
    DOB: "10/12/1982",
    EMPLSTATUS: "1",
    ETHNICITY: "41",
    GENDER: "1",
    HOURLYRATE: "",
    LOCALESTID: "MARMA",
    MAINJOBROLE: "4",
    MAINJRDESC: "",
    NATIONALITY: "826",
    NINUMBER: "JA622112A",
    NMCREG: "",
    NONSCQUAL: "2",
    NURSESPEC: "",
    OTHERJOBROLE: "10",
    OTHERJRDESC: "",
    POSTCODE: "LS1 1AA",
    QUALACH01: "",
    QUALACH01NOTES: "",
    QUALACH02: "",
    QUALACH02NOTES: "",
    QUALACH03: "",
    QUALACH03NOTES: "",
    RECSOURCE: "16",
    SALARY: "20000",
    SALARYINT: "1",
    SCQUAL: "2",
    STARTDATE: "12/11/2001",
    STARTINSECT: "2001",
    STATUS: "UPDATE",
    UNIQUEWORKERID: "3",
    YEAROFENTRY: "",
    ZEROHRCONT: "2"
  },
});

const buildWorkerRecord = build('WorkerRecord', {
  fields: {
    _properties: {
      get() {
        return { changedAt: moment() };
      }
    },
    daysSick: {
      days: 1
    }
  }
})

const buildEstablishmentRecord = build('EstablishmentRecord', {
  _validations: [],
  _username: 'aylingw',
  _id: 479,
  _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
  _ustatus: null,
  _created: '2019-03-15T09:54:10.562Z',
  _updated: '2019-10-04T15:46:16.158Z',
  _updatedBy: 'aylingw',
  _auditEvents: null,
  _name: 'WOZiTech, with even more care',
  _address1: 'First Line',
  _address2: 'Second Line',
  _address3: '',
  _town: 'My Town',
  _county: '',
  _locationId: 'A-328849599',
  _provId: null,
  _postcode: 'LN11 9JG',
  _isRegulated: false,
  _mainService: { id: 16, name: 'Head office services' },
  _nmdsId: 'G1001114',
  _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
  _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
  _establishmentWdfEligibility: null,
  _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
  _isParent: true,
  _parentUid: null,
  _parentId: null,
  _parentName: null,
  _dataOwner: 'Workplace',
  _dataPermissions: 'None',
  _archived: false,
  _dataOwnershipRequested: null,
  _reasonsForLeaving: '',
  _properties: {
    _properties: [Object],
    _propertyTypes: [Array],
    _auditEvents: null,
    _modifiedProperties: [],
    _additionalModels: null
  },
  _isNew: false,
  _workerEntities: {
  },
  _readyForDeletionWorkers: null,
  _status: 'NEW',
  _logLevel: 300,
  daysSick: {
    days: 1
  }
});

const buildSecondEstablishmentRecord = () => buildEstablishmentRecord({
  overrides: {
    _id: 1446,
    _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
    _isRegulated: true,
    _status: 'COMPLETE',
    _parentId: 479,
    _dataOwner: 'Parent'
  }
})

const getUnitInstance = () => {
  const ALL_CAPACITIES = null;
  const ALL_UTILISATIONS = null;
  const BUDI_TO_ASC = 100;

  const bulkUpload = testUtils.sandBox(
    filename,
    {
      locals: {
        require: testUtils.wrapRequire({
          '../BUDI': {
            BUDI
          }, 'moment': {
            moment
          }
        })
      }
    }
  );

  expect(bulkUpload).to.have.property('Worker');

  expect(bulkUpload.Worker).to.be.a('function');

  return new (bulkUpload.Worker)();
};
describe('/server/models/Bulkimport/csv/workers.js', () => {
  const workertoCSV = getUnitInstance();
  let columnHeaders = null;
  describe('get headers', () => {
    it('should return a string of headers seperated by a comma', () => {
      const bulkUpload = getUnitInstance();

      expect(bulkUpload).to.have.property('headers');

      const columnHeaders = bulkUpload.headers;

      expect(columnHeaders).to.be.a('function');

      const result = columnHeaders(maxquals);

      expect(result).to.be.a('string');

      expect(result.split(',')).to.deep.equal(knownHeaders);

    });
  });

  describe('validations', () => {
    it('should emit an error if REGTYPE is not 2 (CQC) but worker has registered manager main job role', async () => {
        const bulkUpload = new (testUtils.sandBox(
          filename,
          {
            locals: {
              require: testUtils.wrapRequire({
                '../BUDI': {
                  BUDI
                },
                'moment': moment
              }),
            },
          }
        ).Worker)(
          buildWorkerCsv(),
          2,
          [
            buildEstablishmentRecord(),
            buildSecondEstablishmentRecord()
          ]);

        expect(bulkUpload).to.have.property('crossValidate');

        const csvWorkerSchemaErrors = [];

        const myEstablishments = [{
          key: 'MARMA',
          status: 'UPDATE',
          regtype: 1
        }];

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        // call the method
        await bulkUpload.crossValidate({
          csvWorkerSchemaErrors,
          myEstablishments,
        });

        // assert a error was returned
        expect(csvWorkerSchemaErrors.length).to.equal(1);

        expect(csvWorkerSchemaErrors[0]).to.deep.equal({
          lineNumber: 2,
          name: 'MARMA',
          source: '4',
          worker: "3",
          errCode: 1280,
          errType: 'MAIN_JOB_ROLE_ERROR',
          error: 'Workers MAINJOBROLE is Registered Manager but you are not providing a CQC regulated service. Please change to another Job Role'
        });
      });
      it('should not emit an error if REGTYPE is 2 (CQC) but worker has registered manager main job role', async () => {
        const bulkUpload = new (testUtils.sandBox(
          filename,
          {
            locals: {
              require: testUtils.wrapRequire({
                '../BUDI': {
                  BUDI
                },
                'moment': moment
              }),
            },
          }
        ).Worker)(
          buildWorkerCsv(),
          2,
          [
            buildEstablishmentRecord({
              overrides: {
                _isRegulated: true
              }
            }),
            buildSecondEstablishmentRecord()
          ]);

        expect(bulkUpload).to.have.property('crossValidate');

        const csvWorkerSchemaErrors = [];

        const myEstablishments = [{
          key: 'MARMA',
          status: 'UPDATE',
          regType: 2
        }];

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        // call the method
        await bulkUpload.crossValidate({
          csvWorkerSchemaErrors,
          myEstablishments,
        });

        // assert a error was returned
        expect(csvWorkerSchemaErrors.length).to.equal(0);

        expect(csvWorkerSchemaErrors).to.deep.equal([]);
      });
    it('should not emit an error if REGTYPE is 2 (CQC) but worker has registered manager main job role', async () => {
        const bulkUpload = new (testUtils.sandBox(
          filename,
          {
            locals: {
              require: testUtils.wrapRequire({
                '../BUDI': {
                  BUDI
                },
                'moment': moment
              }),
            },
          }
        ).Worker)(
          buildWorkerCsv(),
          2,
          [
            buildEstablishmentRecord({
              overrides: {
                _isRegulated: true
              }
            }),
            buildSecondEstablishmentRecord()
          ]);

        expect(bulkUpload).to.have.property('crossValidate');

        const csvWorkerSchemaErrors = [];

        const myEstablishments = [{
          key: 'MARMA',
          status: 'UPDATE',
          regType: 2
        }];

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        // call the method
        await bulkUpload.crossValidate({
          csvWorkerSchemaErrors,
          myEstablishments,
        });

        // assert a error was returned
        expect(csvWorkerSchemaErrors.length).to.equal(0);

        expect(csvWorkerSchemaErrors).to.deep.equal([]);
      });
      it('should not emit an error if REGTYPE is 2 (CQC) but worker doesn\'t have registered manager main job role', async () => {
        const bulkUpload = new (testUtils.sandBox(
          filename,
          {
            locals: {
              require: testUtils.wrapRequire({
                '../BUDI': {
                  BUDI
                },
                'moment': moment
              }),
            },
          }
        ).Worker)(
          buildWorkerCsv({
            overrides: {
              MAINJOBROLE: "3"
            }
          }),
          2,
          [
            buildEstablishmentRecord({
              overrides: {
                _isRegulated: true
              }
            }),
            buildSecondEstablishmentRecord()
          ]);

        expect(bulkUpload).to.have.property('crossValidate');

        const csvWorkerSchemaErrors = [];

        const myEstablishments = [{
          key: 'MARMA',
          status: 'UPDATE',
          regType: 2
        }];

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        // call the method
        await bulkUpload.crossValidate({
          csvWorkerSchemaErrors,
          myEstablishments,
        });

        // assert a error was returned
        expect(csvWorkerSchemaErrors.length).to.equal(0);

        expect(csvWorkerSchemaErrors).to.deep.equal([]);
      });
      it('should not emit an error if REGTYPE is not 2 (CQC) but worker doesn\'t have registered manager main job role', async () => {
        const bulkUpload = new (testUtils.sandBox(
          filename,
          {
            locals: {
              require: testUtils.wrapRequire({
                '../BUDI': {
                  BUDI
                },
                'moment': moment
              }),
            },
          }
        ).Worker)(
          buildWorkerCsv({
            overrides: {
              MAINJOBROLE: "3"
            }
          }),
          2,
          [
            buildEstablishmentRecord({
              overrides: {
                _isRegulated: true
              }
            }),
            buildSecondEstablishmentRecord()
          ]);

        expect(bulkUpload).to.have.property('crossValidate');

        const csvWorkerSchemaErrors = [];

        const myEstablishments = [{
          key: 'MARMA',
          status: 'UPDATE',
          regType: 1
        }];

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        // call the method
        await bulkUpload.crossValidate({
          csvWorkerSchemaErrors,
          myEstablishments,
        });

        // assert a error was returned
        expect(csvWorkerSchemaErrors.length).to.equal(0);

        expect(csvWorkerSchemaErrors).to.deep.equal([]);
      });

      describe('days sick', () => {
        it('should emit a warning when days sick not already changed today', async () => {
          const bulkUpload = new (testUtils.sandBox(
            filename,
            {
              locals: {
                require: testUtils.wrapRequire({
                  '../BUDI': {
                    BUDI
                  },
                  'moment': moment
                }),
              },
            }
          ).Worker)(
            buildWorkerCsv(),
            2,
            [
              buildEstablishmentRecord()
            ]
          );

          bulkUpload._currentWorker = buildWorkerRecord({
            overrides: {
              _properties: {
                get() {
                  return { savedAt: moment().add(-1, 'days') };
                }
              }
            }
          });

          // Regular validation has to run first for the establishment to populate the internal properties correctly
          await bulkUpload.validate();

          // assert a error was returned
          expect(bulkUpload.validationErrors.map(err => err.warning)).to.include('DAYSSICK in the last 12 months has not changed please check this is correct');
        });

        it('should not emit a warning when days sick already changed today', async () => {
          const bulkUpload = new (testUtils.sandBox(
            filename,
            {
              locals: {
                require: testUtils.wrapRequire({
                  '../BUDI': {
                    BUDI
                  },
                  'moment': moment
                }),
              },
            }
          ).Worker)(
            buildWorkerCsv(),
            2,
            [
              buildEstablishmentRecord()
            ]
          );

          bulkUpload._currentWorker = buildWorkerRecord();

          // Regular validation has to run first for the establishment to populate the internal properties correctly
          await bulkUpload.validate();

          // assert a error was returned
          expect(bulkUpload.validationErrors.map(err => err.warning)).not.to.include('DAYSSICK in the last 12 months has not changed please check this is correct');
        });
      })


    const countryCodesToTest = [262, 418, 995];
    countryCodesToTest.forEach(countryCode => {
        it('should validate for COUNTRYOFBIRTH ' + countryCode, async () => {
          const validator = new WorkerCsvValidator(
            buildWorkerCsv({
              overrides: {
                MAINJOBROLE: "3",
                COUNTRYOFBIRTH: `${countryCode}`,
                NATIONALITY: "862",
                STATUS: "NEW"
              }
            }),
            2,
            []);

          const myEstablishments = [{
            key: 'MARMA',
            status: 'UPDATE',
            regType: 1
          }];

          // Regular validation has to run first for the establishment to populate the internal properties correctly
          await validator.validate();

          // call the method
          await validator.transform();

          // assert a error was returned
          expect(validator._validationErrors).to.deep.equal([]);
          expect(validator._validationErrors.length).to.equal(0);
        });

        it('should validate for NATIONALITY ' + countryCode, async () => {
          const validator = new WorkerCsvValidator(
            buildWorkerCsv({
              overrides: {
                MAINJOBROLE: "3",
                COUNTRYOFBIRTH: "826",
                NATIONALITY: `${countryCode}`,
                STATUS: "NEW",
              }
            }),
            2,
            []);

          const myEstablishments = [{
            key: 'MARMA',
            status: 'UPDATE',
            regType: 1
          }];

          // Regular validation has to run first for the establishment to populate the internal properties correctly
          await validator.validate();

          // call the method
          await validator.transform();

          // assert a error was returned
          expect(validator._validationErrors).to.deep.equal([]);
          expect(validator._validationErrors.length).to.equal(0);
        });
      });
    });
  workers.forEach((worker, index) => {
    describe('toCSV(establishmentId, entity, MAX_QUALIFICATIONS) with worker ' + index, () => {
      it('should match the header values', async () => {

      let workerCSV = getUnitInstance();
        const columnHeaders = workerCSV.headers(maxquals).split(',');
        workerCSV = workerCSV.toCSV(establishmentId, worker, maxquals);
        expect(typeof workerCSV).to.equal('string');

        workerCSV = (await csv({
          noheader: true,
          output: 'csv'
        }).fromString(workerCSV))[0];

        expect(Array.isArray(workerCSV)).to.equal(true);

        expect(workerCSV.length).to.equal(knownHeaders.length);

        let otherJobs = '';
        let otherJobsDesc = '';
        let scqual = '';
        let nonscqual = '';
        const mappedCsv = mapCsvToWorker(workerCSV, columnHeaders);

        if (Array.isArray(worker.otherJobs.jobs)) {
          worker.otherJobs.jobs.forEach((job, index) => {
            otherJobs += job.budi;
            if (job.other){
              otherJobsDesc += job.other;
            }
            index < (worker.otherJobs.jobs.length - 1) ? otherJobs += ';' : otherJobs += '';
            index < (worker.otherJobs.jobs.length - 1) ? otherJobsDesc += ';' : otherJobsDesc += '';
          });
        } else {
          expect(establishment.otherServices).to.equal(null);
          expect(worker.otherJobs.otherJobs).to.equal(null);
        }

        if (worker.socialCareQualification) {
          scqual += worker.socialCareQualificationId;
        }
        if (worker.socialCareQualificationLevel) {
          scqual += ";";
          scqual += worker.socialCareQualificationLevel.budi;
        }
        if (worker.nonSocialCareQualification) {
          nonscqual += worker.nonSocialCareQualificationId;
        }
        if (worker.nonSocialCareQualificationLevel) {
          nonscqual += ";";
          nonscqual += worker.nonSocialCareQualificationLevel.budi;
        }
        expect(mappedCsv.LOCALESTID).to.equal(establishmentId);
        expect(mappedCsv.UNIQUEWORKERID).to.equal(worker.localIdentifier);
        expect(mappedCsv.STATUS).to.equal('UNCHECKED');
        expect(mappedCsv.DISPLAYID).to.equal(worker.nameOrId);
        if (worker.nationalInsuranceNumber) {
          expect(mappedCsv.NINUMBER).to.equal(worker.nationalInsuranceNumber.replace(/\s+/g, ''));
        } else {
          expect(mappedCsv.NINUMBER).to.equal('');
        }
        if (worker.postcode) {
          expect(mappedCsv.POSTCODE).to.equal(worker.postcode);
        } else {
          expect(mappedCsv.POSTCODE).to.equal('');
        }
        if (worker.dateOfBirth) {
          const dobParts = worker.dateOfBirth.split('-');
          expect(mappedCsv.DOB).to.equal(`${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`);
        } else {
          expect(mappedCsv.DOB).to.equal('');
        }
        if (worker.gender) {
          expect(parseInt(mappedCsv.GENDER)).to.equal(worker.genderId);
        } else {
          expect(mappedCsv.GENDER).to.equal('');
        }
        if (worker.ethnicity) {
          expect(parseInt(mappedCsv.ETHNICITY)).to.equal(worker.ethnicity.budi);
        } else {
          expect(mappedCsv.ETHNICITY).to.equal('');
        }
        // Needs sandbox
        if (worker.nationality) {
          expect(parseInt(mappedCsv.NATIONALITY)).to.deep.equal(826);
        } else {
          expect(mappedCsv.NATIONALITY).to.equal('');
        }
        if (worker.britishCitizenship) {
          expect(parseInt(mappedCsv.BRITISHCITIZENSHIP)).to.deep.equal(2);
        } else {
          expect(mappedCsv.BRITISHCITIZENSHIP).to.equal('');
        }
        // Needs sandbox
        if (worker.countryOfBirth) {
          expect(parseInt(mappedCsv.COUNTRYOFBIRTH)).to.equal(999);
        } else {
          expect(mappedCsv.COUNTRYOFBIRTH).to.equal('');
        }
        if (worker.disabiliity) {
          expect(parseInt(mappedCsv.DISABLED)).to.equal(worker.disabiliityId);
        } else {
          expect(mappedCsv.DISABLED).to.equal('');
        }
        if (worker.careCerticate) {
          expect(parseInt(mappedCsv.CARECERT)).to.equal(worker.careCerticateId);
        } else {
          expect(mappedCsv.CARECERT).to.equal('');
        }
        // Needs sandbox
        if (worker.recruitmentSource) {
          expect(parseInt(mappedCsv.RECSOURCE)).to.equal(worker.recruitmentSource.budi);
        } else {
          expect(mappedCsv.CARECERT).to.equal('');
        }
        if (worker.mainJobStartDate) {
          const mainJobStartDateParts = worker.mainJobStartDate.split('-');
          expect(mappedCsv.STARTDATE).to.equal(`${mainJobStartDateParts[2]}/${mainJobStartDateParts[1]}/${mainJobStartDateParts[0]}`);
        } else {
          expect(mappedCsv.STARTDATE).to.equal('');
        }
        if (worker.socialCareStartDate) {
          expect(parseInt(mappedCsv.STARTINSECT)).to.equal(2019);
        } else {
          expect(mappedCsv.STARTINSECT).to.equal('');
        }
        if (worker.apprenticeship) {
          expect(parseInt(mappedCsv.APPRENTICE)).to.equal(worker.apprenticeshipId);
        } else {
          expect(mappedCsv.APPRENTICE).to.equal(999);
        }
        if (worker.contract) {
          expect(parseInt(mappedCsv.EMPLSTATUS)).to.equal(worker.contractId);
        } else {
          expect(mappedCsv.EMPLSTATUS).to.equal('');
        }
        if (worker.zeroContractHours) {
          expect(parseInt(mappedCsv.ZEROHRCONT)).to.equal(worker.zeroContractHoursId);
        } else {
          expect(mappedCsv.ZEROHRCONT).to.equal('');
        }
        // Needs sandbox
        if (worker.daysSick) {
          expect(parseInt(mappedCsv.DAYSSICK)).to.equal(worker.daysSick.days);
        } else {
          expect(mappedCsv.DAYSSICK).to.equal('');
        }
        if (worker.annualHourlyPay) {
          const salaryMap = [1,worker.annualHourlyPay.rate,''];
          expect(mappedCsv.SALARYINT).to.equal(String(salaryMap[0]));
          expect(mappedCsv.SALARY).to.equal(String(salaryMap[1]));
          expect(mappedCsv.HOURLYRATE).to.equal(String(salaryMap[2]));
        } else {
          expect(mappedCsv.SALARYINT).to.equal('');
          expect(mappedCsv.SALARY).to.equal('');
          expect(mappedCsv.HOURLYRATE).to.equal('');
        }
        if (worker.mainJob) {
          expect(parseInt(mappedCsv.MAINJOBROLE)).to.equal(worker.mainJob.budi);
        } else {
          expect(mappedCsv.MAINJOBROLE).to.equal('');
        }
        // Needs sandbox
        if (worker.mainJob) {
          expect(parseInt(mappedCsv.MAINJOBROLE)).to.equal(worker.mainJob.budi);
        } else {
          expect(mappedCsv.MAINJOBROLE).to.equal('');
        }
        if (worker.mainJob.other) {
          expect(mappedCsv.MAINJRDESC).to.equal(worker.mainJob.other);
        } else {
          expect(mappedCsv.MAINJRDESC).to.equal('');
        }
        if (worker.contract && ['Permanent', 'Temporary'].includes(worker.contract) && worker.zeroContractHours !== 'Yes' && worker.contractedHours) {
          expect(mappedCsv.CONTHOURS).to.equal(worker.contractedHours.hours);
        } else {
          expect(mappedCsv.CONTHOURS).to.equal('');
        }
        if (((worker.contract && ['Pool/Bank', 'Agency', 'Other'].includes(worker.contract)) || worker.zeroContractHours === 'Yes') && worker.averageHours) {
            expect(parseInt(mappedCsv.AVGHOURS)).to.equal(worker.averageHours.hours);
        } else {
          expect(mappedCsv.AVGHOURS).to.equal('');
        }
        expect(mappedCsv.OTHERJOBROLE).to.equal(otherJobs);
        expect(mappedCsv.OTHERJRDESC).to.equal(otherJobsDesc);
        if (worker.registeredNurse) {
          expect(mappedCsv.NMCREG).to.equal(worker.registeredNurseId);
        } else {
          expect(mappedCsv.NMCREG).to.equal('');
        }
        // Needs sandbox
        if (worker.nurseSpecialism) {
          expect(parseInt(mappedCsv.NURSESPEC)).to.equal(worker.nurseSpecialism.id);
        } else {
          expect(mappedCsv.NURSESPEC).to.equal('');
        }
        if (worker.approvedMentalHealthWorker) {
          expect(parseInt(mappedCsv.AMHP)).to.equal(worker.approvedMentalHealthWorkerId);
        } else {
          expect(mappedCsv.AMHP).to.equal('');
        }
        if (worker.socialCareQualification) {
          expect(mappedCsv.SCQUAL).to.equal(scqual);
        } else {
          expect(mappedCsv.SCQUAL).to.equal('');
        }
        if (worker.nonSocialCareQualification) {
          expect(mappedCsv.NONSCQUAL).to.equal(nonscqual);
        } else {
          expect(mappedCsv.NONSCQUAL).to.equal('');
        }
        for (var i = 0; i < maxquals; i++) {
          if (worker.qualifications[i]) {
            const year = worker.qualifications[i].year ? worker.qualifications[i].year : '';
            expect(mappedCsv['QUALACH0' + (i + 1)]).to.equal(worker.qualifications[i].qualification.budi + ";" + year);
            if (worker.qualifications[i].notes) {
              expect(mappedCsv['QUALACH0' + (i + 1) + 'NOTES']).to.equal(worker.qualifications[i].notes);
            } else {
              expect(mappedCsv['QUALACH0' + (i + 1) + 'NOTES']).to.equal('');
            }
          } else {
            expect(mappedCsv['QUALACH0' + (i + 1)]).to.equal('');
            expect(mappedCsv['QUALACH0' + (i + 1) + 'NOTES']).to.equal('');
          }
        }
      });
    });
    apprenticeshipTypes.forEach(apprenticeshipType => {
      it('should output the correct apprenticeship figure with apprenticeship value ' + apprenticeshipType.value, async () => {
        worker.apprenticeship = apprenticeshipType.value;
        let workerCSV = getUnitInstance();
        workerCSV = workerCSV.toCSV(establishmentId, worker, maxquals);
        const output = workerCSV.split(',');
        // 19 column is apprenticeship
        expect(output[18]).to.deep.equal(apprenticeshipType.code);
      });
    });
  });
});
