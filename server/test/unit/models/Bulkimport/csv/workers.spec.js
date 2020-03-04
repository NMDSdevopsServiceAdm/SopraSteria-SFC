const expect = require('chai').expect;
const workers = require('../../../mockdata/workers').data;
const establishmentId = require('../../../mockdata/workers').establishmentId;
const maxquals = require('../../../mockdata/workers').maxquals;
const knownHeaders = require('../../../mockdata/workers').knownHeaders;
const moment = require('moment');
const filename = 'server/models/BulkImport/csv/workers.js';

const testUtils = require('../../../../../utils/testUtils');
const csv = require('csvtojson');

const BUDI_TO_ASC = 100;

function mapCsvToWorker(worker, headers) {
  const mapped = {};
  headers.forEach((header, index) => {
    mapped[header] = worker[index];
  });
  return mapped;
}

const BUDI = {
    ethnicity: (direction, originalCode) => {
      const fixedMapping = [
        { ASC: 1, BUDI: 31 },
        { ASC: 3, BUDI: 32 },
        { ASC: 4, BUDI: 33 },
        { ASC: 5, BUDI: 34 },
        { ASC: 6, BUDI: 35 },
        { ASC: 7, BUDI: 36 },
        { ASC: 8, BUDI: 37 },
        { ASC: 9, BUDI: 38 },
        { ASC: 10, BUDI: 39 },
        { ASC: 11, BUDI: 40 },
        { ASC: 12, BUDI: 41 },
        { ASC: 13, BUDI: 42 },
        { ASC: 14, BUDI: 43 },
        { ASC: 15, BUDI: 44 },
        { ASC: 16, BUDI: 45 },
        { ASC: 17, BUDI: 46 },
        { ASC: 18, BUDI: 47 },
        { ASC: 19, BUDI: 98 },
        { ASC: 2, BUDI: 99 }
      ];

      if (direction === BUDI_TO_ASC) {
        const found = fixedMapping.find(thisEthnicity => thisEthnicity.BUDI === originalCode);
        return found ? found.ASC : null;
      }

      const found = fixedMapping.find(thisEthnicity => thisEthnicity.ASC === originalCode);
      return found ? found.BUDI : null;
    },

    jobRoles: (direction, originalCode) => {
      const fixedMapping = [
        { ASC: 26, BUDI: 1 },
        { ASC: 15, BUDI: 2 },
        { ASC: 13, BUDI: 3 },
        { ASC: 22, BUDI: 4 },
        { ASC: 28, BUDI: 5 },
        { ASC: 27, BUDI: 6 },
        { ASC: 25, BUDI: 7 },
        { ASC: 10, BUDI: 8 },
        { ASC: 11, BUDI: 9 },
        { ASC: 12, BUDI: 10 },
        { ASC: 3, BUDI: 11 },
        { ASC: 18, BUDI: 15 },
        { ASC: 23, BUDI: 16 },
        { ASC: 4, BUDI: 17 },
        { ASC: 29, BUDI: 22 },
        { ASC: 20, BUDI: 23 },
        { ASC: 14, BUDI: 24 },
        { ASC: 2, BUDI: 25 },
        { ASC: 5, BUDI: 26 },
        { ASC: 21, BUDI: 27 },
        { ASC: 1, BUDI: 34 },
        { ASC: 24, BUDI: 35 },
        { ASC: 19, BUDI: 36 },
        { ASC: 17, BUDI: 37 },
        { ASC: 16, BUDI: 38 },
        { ASC: 7, BUDI: 39 },
        { ASC: 8, BUDI: 40 },
        { ASC: 9, BUDI: 41 },
        { ASC: 6, BUDI: 42 }
      ];

      if (direction === BUDI_TO_ASC) {
        const found = fixedMapping.find(thisJob => thisJob.BUDI === originalCode);
        return found ? found.ASC : null;
      }

      const found = fixedMapping.find(thisJob => thisJob.ASC === originalCode);
      return found ? found.BUDI : null;
    },
    nursingSpecialist: (direction, originalCode) => {
      const fixedMapping = [
        { BUDI: 1, ASC: 1 },
        { BUDI: 2, ASC: 2 },
        { BUDI: 3, ASC: 3 },
        { BUDI: 4, ASC: 4 },
        { BUDI: 5, ASC: 5 },
        { BUDI: 6, ASC: 6 },
        { BUDI: 7, ASC: 7 },
        { BUDI: 8, ASC: 8 }
      ];

      if (direction === BUDI_TO_ASC) {
        const found = fixedMapping.find(thisSpecialist => thisSpecialist.BUDI === originalCode);
        return found ? found.ASC : null;
      }

      const found = fixedMapping.find(thisSpecialist => thisSpecialist.ASC === originalCode);
      return found ? found.BUDI : null;
    },
    qualificationLevels: (direction, originalCode) => {
      const fixedMapping = [
        { BUDI: 0, ASC: 1 },
        { BUDI: 1, ASC: 2 },
        { BUDI: 2, ASC: 3 },
        { BUDI: 3, ASC: 4 },
        { BUDI: 4, ASC: 5 },
        { BUDI: 5, ASC: 6 },
        { BUDI: 6, ASC: 7 },
        { BUDI: 7, ASC: 8 },
        { BUDI: 8, ASC: 9 },
        { BUDI: 999, ASC: 10 }
      ];

      if (direction === BUDI_TO_ASC) {
        const found = fixedMapping.find(thisSpecialist => thisSpecialist.BUDI === originalCode);
        return found ? found.ASC : null;
      }

      const found = fixedMapping.find(thisSpecialist => thisSpecialist.ASC === originalCode);
      return found ? found.BUDI : null;
    },
    qualifications: (direction, originalCode) => {
      const fixedMapping = [
        { BUDI: 1, ASC: 97 },
        { BUDI: 2, ASC: 98 },
        { BUDI: 3, ASC: 96 },
        { BUDI: 4, ASC: 93 },
        { BUDI: 5, ASC: 94 },
        { BUDI: 6, ASC: 95 },
        { BUDI: 8, ASC: 24 },
        { BUDI: 9, ASC: 99 },
        { BUDI: 10, ASC: 100 },
        { BUDI: 12, ASC: 25 },
        { BUDI: 13, ASC: 102 },
        { BUDI: 14, ASC: 107 },
        { BUDI: 15, ASC: 106 },
        { BUDI: 16, ASC: 72 },
        { BUDI: 17, ASC: 89 },
        { BUDI: 18, ASC: 71 },
        { BUDI: 19, ASC: 16 },
        { BUDI: 20, ASC: 1 },
        { BUDI: 22, ASC: 14 },
        { BUDI: 25, ASC: 15 },
        { BUDI: 26, ASC: 26 },
        { BUDI: 27, ASC: 114 },
        { BUDI: 28, ASC: 116 },
        { BUDI: 32, ASC: 115 },
        { BUDI: 33, ASC: 113 },
        { BUDI: 34, ASC: 111 },
        { BUDI: 35, ASC: 109 },
        { BUDI: 36, ASC: 110 },
        { BUDI: 37, ASC: 117 },
        { BUDI: 38, ASC: 118 },
        { BUDI: 39, ASC: 119 },
        { BUDI: 41, ASC: 20 },
        { BUDI: 42, ASC: 30 },
        { BUDI: 48, ASC: 4 },
        { BUDI: 49, ASC: 5 },
        { BUDI: 50, ASC: 60 },
        { BUDI: 51, ASC: 61 },
        { BUDI: 52, ASC: 10 },
        { BUDI: 53, ASC: 80 },
        { BUDI: 54, ASC: 81 },
        { BUDI: 55, ASC: 82 },
        { BUDI: 56, ASC: 83 },
        { BUDI: 57, ASC: 84 },
        { BUDI: 58, ASC: 85 },
        { BUDI: 62, ASC: 86 },
        { BUDI: 63, ASC: 87 },
        { BUDI: 64, ASC: 88 },
        { BUDI: 67, ASC: 21 },
        { BUDI: 68, ASC: 22 },
        { BUDI: 72, ASC: 23 },
        { BUDI: 73, ASC: 32 },
        { BUDI: 74, ASC: 19 },
        { BUDI: 76, ASC: 64 },
        { BUDI: 77, ASC: 65 },
        { BUDI: 82, ASC: 103 },
        { BUDI: 83, ASC: 104 },
        { BUDI: 84, ASC: 105 },
        { BUDI: 85, ASC: 17 },
        { BUDI: 86, ASC: 2 },
        { BUDI: 87, ASC: 45 },
        { BUDI: 88, ASC: 9 },
        { BUDI: 89, ASC: 69 },
        { BUDI: 90, ASC: 12 },
        { BUDI: 91, ASC: 18 },
        { BUDI: 92, ASC: 130 },
        { BUDI: 93, ASC: 62 },
        { BUDI: 94, ASC: 66 },
        { BUDI: 95, ASC: 67 },
        { BUDI: 96, ASC: 11 },
        { BUDI: 98, ASC: 59 },
        { BUDI: 99, ASC: 6 },
        { BUDI: 100, ASC: 7 },
        { BUDI: 101, ASC: 68 },
        { BUDI: 102, ASC: 63 },
        { BUDI: 103, ASC: 8 },
        { BUDI: 104, ASC: 75 },
        { BUDI: 105, ASC: 76 },
        { BUDI: 107, ASC: 3 },
        { BUDI: 108, ASC: 47 },
        { BUDI: 109, ASC: 74 },
        { BUDI: 110, ASC: 31 },
        { BUDI: 111, ASC: 27 },
        { BUDI: 112, ASC: 28 },
        { BUDI: 113, ASC: 134 },
        { BUDI: 114, ASC: 135 },
        { BUDI: 115, ASC: 90 },
        { BUDI: 116, ASC: 91 },
        { BUDI: 92, ASC: 13 },
        { BUDI: 119, ASC: 33 },
        { BUDI: 121, ASC: 34 },
        { BUDI: 136, ASC: 35 },
        { BUDI: 123, ASC: 36 },
        { BUDI: 124, ASC: 37 },
        { BUDI: 125, ASC: 38 },
        { BUDI: 118, ASC: 39 },
        { BUDI: 137, ASC: 40 },
        { BUDI: 131, ASC: 41 },
        { BUDI: 134, ASC: 42 },
        { BUDI: 138, ASC: 43 },
        { BUDI: 143, ASC: 44 },
        { BUDI: 141, ASC: 48 },
        { BUDI: 120, ASC: 49 },
        { BUDI: 122, ASC: 50 },
        { BUDI: 126, ASC: 51 },
        { BUDI: 128, ASC: 52 },
        { BUDI: 127, ASC: 53 },
        { BUDI: 142, ASC: 54 },
        { BUDI: 133, ASC: 55 },
        { BUDI: 135, ASC: 56 },
        { BUDI: 139, ASC: 57 },
        { BUDI: 140, ASC: 58 },
        { BUDI: 129, ASC: 77 },
        { BUDI: 130, ASC: 78 },
        { BUDI: 132, ASC: 79 },
        { BUDI: 117, ASC: 112 },
        { BUDI: 302, ASC: 121 },
        { BUDI: 304, ASC: 122 },
        { BUDI: 303, ASC: 123 },
        { BUDI: 310, ASC: 124 },
        { BUDI: 308, ASC: 125 },
        { BUDI: 306, ASC: 126 },
        { BUDI: 301, ASC: 127 },
        { BUDI: 305, ASC: 128 },
        { BUDI: 307, ASC: 129 },
        { BUDI: 312, ASC: 131 },
        { BUDI: 313, ASC: 132 },
        { BUDI: 311, ASC: 133 }
      ];

      if (direction === BUDI_TO_ASC) {
        const found = fixedMapping.find(thisQualification => thisQualification.BUDI === originalCode);
        return found ? found.ASC : null;
      }

      const found = fixedMapping.find(thisQualification => thisQualification.ASC === originalCode);
      return found ? found.BUDI : null;
    }
};

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
          {
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
          2,
          [
            {
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
              _logLevel: 300
            },
            {
              _validations: [],
              _username: 'aylingw',
              _id: 1446,
              _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
              _ustatus: null,
              _created: '2019-07-31T15:09:57.405Z',
              _updated: '2019-10-04T15:46:16.797Z',
              _updatedBy: 'aylingw',
              _auditEvents: null,
              _name: 'WOZiTech Cares Sub 100',
              _address1: 'Number 1',
              _address2: 'My street',
              _address3: '',
              _town: 'My Town',
              _county: '',
              _locationId: '1-888777666',
              _provId: '1-999888777',
              _postcode: 'LN11 9JG',
              _isRegulated: true,
              _mainService: { id: 1, name: 'Carers support' },
              _nmdsId: 'G1002110',
              _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
              _overallWdfEligibility: null,
              _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
              _staffWdfEligibility: null,
              _isParent: false,
              _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
              _parentId: 479,
              _parentName: null,
              _dataOwner: 'Parent',
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
              _workerEntities: {},
              _readyForDeletionWorkers: null,
              _status: 'COMPLETE',
              _logLevel: 300
            }
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
          {
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
          2,
          [
            {
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
              _isRegulated: true,
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
              _logLevel: 300
            },
            {
              _validations: [],
              _username: 'aylingw',
              _id: 1446,
              _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
              _ustatus: null,
              _created: '2019-07-31T15:09:57.405Z',
              _updated: '2019-10-04T15:46:16.797Z',
              _updatedBy: 'aylingw',
              _auditEvents: null,
              _name: 'WOZiTech Cares Sub 100',
              _address1: 'Number 1',
              _address2: 'My street',
              _address3: '',
              _town: 'My Town',
              _county: '',
              _locationId: '1-888777666',
              _provId: '1-999888777',
              _postcode: 'LN11 9JG',
              _isRegulated: true,
              _mainService: { id: 1, name: 'Carers support' },
              _nmdsId: 'G1002110',
              _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
              _overallWdfEligibility: null,
              _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
              _staffWdfEligibility: null,
              _isParent: false,
              _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
              _parentId: 479,
              _parentName: null,
              _dataOwner: 'Parent',
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
              _workerEntities: {},
              _readyForDeletionWorkers: null,
              _status: 'COMPLETE',
              _logLevel: 300
            }
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
          {
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
          2,
          [
            {
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
              _isRegulated: true,
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
              _logLevel: 300
            },
            {
              _validations: [],
              _username: 'aylingw',
              _id: 1446,
              _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
              _ustatus: null,
              _created: '2019-07-31T15:09:57.405Z',
              _updated: '2019-10-04T15:46:16.797Z',
              _updatedBy: 'aylingw',
              _auditEvents: null,
              _name: 'WOZiTech Cares Sub 100',
              _address1: 'Number 1',
              _address2: 'My street',
              _address3: '',
              _town: 'My Town',
              _county: '',
              _locationId: '1-888777666',
              _provId: '1-999888777',
              _postcode: 'LN11 9JG',
              _isRegulated: true,
              _mainService: { id: 1, name: 'Carers support' },
              _nmdsId: 'G1002110',
              _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
              _overallWdfEligibility: null,
              _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
              _staffWdfEligibility: null,
              _isParent: false,
              _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
              _parentId: 479,
              _parentName: null,
              _dataOwner: 'Parent',
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
              _workerEntities: {},
              _readyForDeletionWorkers: null,
              _status: 'COMPLETE',
              _logLevel: 300
            }
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
          {
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
            MAINJOBROLE: "3",
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
          2,
          [
            {
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
              _isRegulated: true,
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
              _logLevel: 300
            },
            {
              _validations: [],
              _username: 'aylingw',
              _id: 1446,
              _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
              _ustatus: null,
              _created: '2019-07-31T15:09:57.405Z',
              _updated: '2019-10-04T15:46:16.797Z',
              _updatedBy: 'aylingw',
              _auditEvents: null,
              _name: 'WOZiTech Cares Sub 100',
              _address1: 'Number 1',
              _address2: 'My street',
              _address3: '',
              _town: 'My Town',
              _county: '',
              _locationId: '1-888777666',
              _provId: '1-999888777',
              _postcode: 'LN11 9JG',
              _isRegulated: true,
              _mainService: { id: 1, name: 'Carers support' },
              _nmdsId: 'G1002110',
              _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
              _overallWdfEligibility: null,
              _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
              _staffWdfEligibility: null,
              _isParent: false,
              _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
              _parentId: 479,
              _parentName: null,
              _dataOwner: 'Parent',
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
              _workerEntities: {},
              _readyForDeletionWorkers: null,
              _status: 'COMPLETE',
              _logLevel: 300
            }
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
          {
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
            MAINJOBROLE: "3",
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
          2,
          [
            {
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
              _isRegulated: true,
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
              _logLevel: 300
            },
            {
              _validations: [],
              _username: 'aylingw',
              _id: 1446,
              _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
              _ustatus: null,
              _created: '2019-07-31T15:09:57.405Z',
              _updated: '2019-10-04T15:46:16.797Z',
              _updatedBy: 'aylingw',
              _auditEvents: null,
              _name: 'WOZiTech Cares Sub 100',
              _address1: 'Number 1',
              _address2: 'My street',
              _address3: '',
              _town: 'My Town',
              _county: '',
              _locationId: '1-888777666',
              _provId: '1-999888777',
              _postcode: 'LN11 9JG',
              _isRegulated: true,
              _mainService: { id: 1, name: 'Carers support' },
              _nmdsId: 'G1002110',
              _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
              _overallWdfEligibility: null,
              _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
              _staffWdfEligibility: null,
              _isParent: false,
              _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
              _parentId: 479,
              _parentName: null,
              _dataOwner: 'Parent',
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
              _workerEntities: {},
              _readyForDeletionWorkers: null,
              _status: 'COMPLETE',
              _logLevel: 300
            }
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

        if (Array.isArray(worker.otherJobs.otherJobs)) {
          worker.otherJobs.otherJobs.forEach((job, index) => {
            otherJobs += job.budi;
            if (job.other){
              otherJobsDesc += job.other;
            }
            index < (worker.otherJobs.otherJobs.length - 1) ? otherJobs += ';' : otherJobs += '';
            index < (worker.otherJobs.otherJobs.length - 1) ? otherJobsDesc += ';' : otherJobsDesc += '';
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
  });
});
