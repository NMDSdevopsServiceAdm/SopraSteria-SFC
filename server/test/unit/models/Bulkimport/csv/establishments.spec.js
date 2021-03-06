const expect = require('chai').expect;
const BUDI = require('../../../../../models/BulkImport/BUDI').BUDI;
const buildEstablishmentCSV = require('../../../../factories/establishment/csv');
const buildWorkerCSV = require('../../../../factories/worker/csv');
const establishmentCsv = require('../../../../../models/BulkImport/csv/establishments').Establishment;
const workerCsv = require('../../../../../models/BulkImport/csv/workers');
const models = require('../../../../../models');
const sandbox = require('sinon').createSandbox();
const { apiEstablishmentBuilder } = require('../../../../integration/utils/establishment');

const validateAPIObject = (establishmentRow) => {
  return {
    Address1: establishmentRow.ADDRESS1,
    Address2: establishmentRow.ADDRESS2,
    Address3: '',
    Town: establishmentRow.POSTTOWN,
    Postcode: establishmentRow.POSTCODE,
    LocationId: establishmentRow.LOCATIONID,
    locationId: establishmentRow.LOCATIONID,
    ProvId: establishmentRow.PROVNUM,
    IsCQCRegulated: true,
    reasonsForLeaving: '',
    status: 'NEW',
    name: establishmentRow.ESTNAME,
    localIdentifier: establishmentRow.LOCALESTID,
    isRegulated: true,
    employerType: { value: 'Private Sector', other: undefined },
    localAuthorities: [708, 721, 720],
    mainService: 8,
    services: { value: 'Yes', services: [{ id: 8 }, { id: 13 }] },
    serviceUsers: [],
    numberOfStaff: 1,
    vacancies: [999, 333, 1],
    starters: [0, 0, 0],
    leavers: [999, 0, 0],
    share: { enabled: true, with: ['CQC', 'Local Authority'] },
    capacities: [0, 0, 0, 0],
  };
};
const generateWorkerFromCsv = (currentLine, lineNumber = 1, allCurrentEstablishments = []) => {
  const worker = new workerCsv.Worker(currentLine, lineNumber, allCurrentEstablishments);
  worker.validate();

  return worker;
};

const generateEstablishmentFromCsv = async (currentLine, lineNumber = 1, allCurrentEstablishments = []) => {
  const establishment = new establishmentCsv(currentLine, lineNumber, allCurrentEstablishments);

  await establishment.validate();

  return establishment;
};

const crossValidate = async (establishmentRow, workerRow, callback, databaseWorkers = []) => {
  const establishment = await generateEstablishmentFromCsv(establishmentRow);

  const myWorkers = [generateWorkerFromCsv(workerRow)];

  const csvEstablishmentSchemaErrors = [];

  const fetchMyEstablishmentsWorkers = sandbox.spy(async () => {
    return databaseWorkers;
  });

  await establishment.crossValidate({
    csvEstablishmentSchemaErrors,
    myWorkers,
    fetchMyEstablishmentsWorkers,
  });

  callback(csvEstablishmentSchemaErrors);
};

describe('Bulk Upload - Establishment CSV', () => {
  beforeEach(() => {
    sandbox.stub(BUDI, 'initialize');
    sandbox.stub(establishmentCsv.prototype, '_validateNoChange').callsFake(() => {
      return true;
    });

    sandbox.stub(models.pcodedata, 'findAll').returns([{}]);
    sandbox.stub(models.establishment, 'findAll').returns([]);
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('toAPI', () => {
    it('should return a correct API format ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      const establishment = await generateEstablishmentFromCsv(establishmentRow);

      const apiObject = establishment.toAPI();
      expect(apiObject).to.deep.equal(validateAPIObject(establishmentRow));
    });
    it('should return a correct all services if ; added on the end ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '1';
      establishmentRow.ALLSERVICES = '0;1';
      establishmentRow.SERVICEDESC = '10;';
      establishmentRow.UTILISATION = '5;';
      establishmentRow.CAPACITY = '1;';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();
      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: 'No' };
      expectedResult.capacities = [1, 5];
      expectedResult.mainService = 1;

      expect(apiObject).to.deep.equal(expectedResult);
    });
    it('should return a correct all services if ; is in front ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '1';
      establishmentRow.ALLSERVICES = '0;1';
      establishmentRow.SERVICEDESC = ';10';
      establishmentRow.UTILISATION = ';5';
      establishmentRow.CAPACITY = ';1';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();
      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: 'No' };
      expectedResult.capacities = [1, 5];
      expectedResult.mainService = 1;

      expect(apiObject).to.deep.equal(expectedResult);
    });
    it('should return a correct all services without the need of ; on util/cap/servicedesc ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '1';
      establishmentRow.ALLSERVICES = '0;1';
      establishmentRow.SERVICEDESC = '10';
      establishmentRow.UTILISATION = '5';
      establishmentRow.CAPACITY = '1';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();
      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: 'No' };
      expectedResult.capacities = [1, 5];
      expectedResult.mainService = 1;

      expect(apiObject).to.deep.equal(expectedResult);
    });
    it('should return a correct all services when its NO', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '8';
      establishmentRow.ALLSERVICES = '8;0';
      establishmentRow.SERVICEDESC = '';
      establishmentRow.UTILISATION = '';
      establishmentRow.CAPACITY = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();
      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: 'No' };
      expectedResult.capacities = [null, null];

      expect(apiObject).to.deep.equal(expectedResult);
    });
    it('should return a correct all services when its YES ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '8';
      establishmentRow.ALLSERVICES = '8;6';
      establishmentRow.SERVICEDESC = ';';
      establishmentRow.UTILISATION = ';';
      establishmentRow.CAPACITY = ';';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();

      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: 'Yes', services: [{ id: 8 }, { id: 6 }] };
      expectedResult.capacities = [null, null, null, null];

      expect(apiObject).to.deep.equal(expectedResult);
    });
    it('should return a correct all services when its YES and there are two ALLSERVICES ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '8';
      establishmentRow.ALLSERVICES = '8;10';
      establishmentRow.SERVICEDESC = ';';
      establishmentRow.UTILISATION = '78;9';
      establishmentRow.CAPACITY = ';';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();

      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: 'Yes', services: [{ id: 8 }, { id: 10 }] };
      expectedResult.capacities = [null, null, 78, 9];
      expect(establishment.validationErrors.length).to.equal(0);
      expect(apiObject).to.deep.equal(expectedResult);
    });

    it('should return a correct all services when its null ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '8';
      establishmentRow.ALLSERVICES = '8';
      establishmentRow.SERVICEDESC = '';
      establishmentRow.UTILISATION = '';
      establishmentRow.CAPACITY = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();

      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: null };
      expectedResult.capacities = [null, null];

      expect(apiObject).to.deep.equal(expectedResult);
    });
    it('should return a correct all services when util contains ; ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '8';
      establishmentRow.ALLSERVICES = '8;0';
      establishmentRow.SERVICEDESC = ';';
      establishmentRow.UTILISATION = ';';
      establishmentRow.CAPACITY = ';';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();
      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: 'No' };
      expectedResult.capacities = [null, null];

      expect(apiObject).to.deep.equal(expectedResult);
    });
    it('should return a correct all services ALLSERVICES doesnt contain ; ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '8';
      establishmentRow.ALLSERVICES = '8';
      establishmentRow.SERVICEDESC = ';';
      establishmentRow.UTILISATION = ';';
      establishmentRow.CAPACITY = ';';
      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const apiObject = establishment.toAPI();
      const expectedResult = validateAPIObject(establishmentRow);
      expectedResult.services = { value: null };
      expectedResult.capacities = [null, null];

      expect(apiObject).to.deep.equal(expectedResult);
    });
  });
  describe('toJSON', () => {
    it('should return a correct JSON ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      const JSONObject = establishment.toJSON();
      expect(JSONObject).to.deep.equal({
        status: 'NEW',
        name: establishmentRow.ESTNAME,
        address1: establishmentRow.ADDRESS1,
        address2: establishmentRow.ADDRESS2,
        address3: '',
        town: establishmentRow.POSTTOWN,
        postcode: establishmentRow.POSTCODE,
        employerType: 'Private Sector',
        employerTypeOther: undefined,
        shareWithCQC: 1,
        shareWithLA: 1,
        localAuthorities: [708, 721, 720],
        regType: 2,
        locationId: establishmentRow.LOCATIONID,
        provId: establishmentRow.PROVNUM,
        mainService: 8,
        allServices: [{ id: 8 }, { id: 13 }],
        serviceUsers: undefined,
        capacities: [0, 0],
        utilisations: [0, 0],
        totalPermTemp: 1,
        allJobs: [34, 8, 4],
        counts: {
          vacancies: [999, 333, 1],
          starters: [0, 0, 0],
          leavers: [999, 0, 0],
          reasonsForLeaving: undefined,
        },
      });
    });
  });
  describe('Validations', () => {
    it('should return no errors ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      expect(establishment.validationErrors).to.deep.equal([]);
    });

    it('should validate ALLSERVICES if MAINSERVICE is not included ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '8';
      establishmentRow.ALLSERVICES = '12;13';
      const establishment = await generateEstablishmentFromCsv(establishmentRow);

      expect(establishment.validationErrors).to.deep.equal([
        {
          origin: 'Establishments',
          lineNumber: establishment.lineNumber,
          errCode: 1120,
          errType: 'ALL_SERVICES_ERROR',
          error: 'MAINSERVICE is not included in ALLSERVICES',
          source: '12;13',
          column: 'ALLSERVICES',
          name: establishmentRow.LOCALESTID,
        },
      ]);
    });
    it('should through an error if ALLSERVICES has a 0 and an other service ', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.MAINSERVICE = '8';
      establishmentRow.ALLSERVICES = '8;0;13';
      const establishment = await generateEstablishmentFromCsv(establishmentRow);

      expect(establishment.validationErrors).to.deep.equal([
        {
          origin: 'Establishments',
          lineNumber: establishment.lineNumber,
          errCode: 1121,
          errType: 'ALL_SERVICES_ERROR_NONE',
          error: 'ALLSERVICES is 0 (none) but contains services other than the MAINSERVICE',
          source: '8;0;13',
          column: 'ALLSERVICES',
          name: establishmentRow.LOCALESTID,
        },
      ]);
    });

    it('should validate Starters, Leavers, Vacancies if All Job Roles is blank but S/L/V is not blank', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.ALLJOBROLES = '';
      establishmentRow.STARTERS = '1';
      establishmentRow.LEAVERS = '2';
      establishmentRow.VACANCIES = '3';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);

      expect(establishment.validationErrors).to.deep.equal([
        {
          origin: 'Establishments',
          lineNumber: establishment.lineNumber,
          errCode: 1280,
          errType: 'ALL_JOBS_ERROR',
          error: 'ALLJOBROLES cannot be blank as you have STARTERS, LEAVERS, VACANCIES greater than zero',
          source: '',
          column: 'ALLJOBROLES',
          name: establishmentRow.LOCALESTID,
        },
      ]);
    });

    it('should skip validating Starters, Leavers, Vacancies if All Job Roles and S/L/V is blank', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.ALLJOBROLES = '';
      establishmentRow.STARTERS = '';
      establishmentRow.LEAVERS = '';
      establishmentRow.VACANCIES = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      expect(establishment.validationErrors).to.deep.equal([]);
    });
  });

  describe('Cross Validations', () => {
    it('should show error if not Head Office and no registered manager or vacancy for one', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'NEW',
          TOTALPERMTEMP: 1,
          VACANCIES: '0;0;0',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0].error).to.deep.equal(
          'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
        );
      });
    });
    it('should NOT show error if Head Office and no registered manager or vacancy for one', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'NEW',
          TOTALPERMTEMP: 1,
          VACANCIES: '0;0;0',
          MAINSERVICE: '72',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors.length).to.equal(0);
      });
    });
    it('should NOT show error if not Head Office and registered manager is UNCHECKED ', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'NEW',
          TOTALPERMTEMP: 1,
          VACANCIES: '0;0;0',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
          MAINJOBROLE: 4,
          STATUS: 'UNCHECKED',
          UNIQUEWORKERID: 'bob',
        },
      });
      const databaseWorkers = [
        {
          uniqueWorker: 'bob',
          contractTypeId: 'Permanent',
          mainJobRoleId: 22,
          otherJobIds: '',
        },
      ];
      crossValidate(
        establishmentRow,
        workerRow,
        (csvEstablishmentSchemaErrors) => {
          expect(csvEstablishmentSchemaErrors.length).to.equal(0);
        },
        databaseWorkers,
      );
    });
    it('should NOT show error if not Head Office and registered manager is moving into workplace ', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'NEW',
          TOTALPERMTEMP: 1,
          VACANCIES: '0;0;0',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
          MAINJOBROLE: 4,
          STATUS: 'CHGSUB',
          UNIQUEWORKERID: 'bob',
        },
      });
      const databaseWorkers = [
        {
          uniqueWorker: 'bob',
          contractTypeId: 'Permanent',
          mainJobRoleId: 22,
          otherJobIds: '',
        },
      ];
      crossValidate(
        establishmentRow,
        workerRow,
        (csvEstablishmentSchemaErrors) => {
          expect(csvEstablishmentSchemaErrors.length).to.equal(0);
        },
        databaseWorkers,
      );
    });
    it('should show error if not Head Office and registered manager is DELETE ', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'NEW',
          TOTALPERMTEMP: 1,
          VACANCIES: '0;0;0',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
          MAINJOBROLE: 4,
          STATUS: 'DELETE',
          UNIQUEWORKERID: 'bob',
        },
      });
      const databaseWorkers = [
        {
          uniqueWorker: 'bob',
          contractTypeId: 'Permanent',
          mainJobRoleId: 22,
          otherJobIds: '',
        },
      ];
      crossValidate(
        establishmentRow,
        workerRow,
        (csvEstablishmentSchemaErrors) => {
          expect(csvEstablishmentSchemaErrors[0].errCode).to.equal(1280);
        },
        databaseWorkers,
      );
    });
    it('should validate the total number of staff with the # of staff provided in the Worker CSV when the status is NEW', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'NEW',
          TOTALPERMTEMP: 2,
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0].warning).to.deep.equal(
          'TOTALPERMTEMP (Total staff and the number of worker records) does not match',
        );
      });
    });

    it('should validate the total number of staff with the # of staff provided in the Worker CSV when the status is UPDATE', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'UPDATE',
          TOTALPERMTEMP: 2,
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0].warning).to.deep.equal(
          'TOTALPERMTEMP (Total staff and the number of worker records) does not match',
        );
      });
    });

    it('should validate the total number of staff with the # of staff provided in the Worker CSV when the status is NOCHANGE', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'NOCHANGE',
          TOTALPERMTEMP: 2,
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0].warning).to.deep.equal(
          'TOTALPERMTEMP (Total staff and the number of worker records) does not match',
        );
      });
    });

    it('should not validate the total number of staff with the # of staff provided in the Worker CSV when the status is UNCHECKED', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'UNCHECKED',
          TOTALPERMTEMP: 2,
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0]).to.be.undefined;
      });
    });

    it('should not validate the total number of staff with the # of staff provided in the Worker CSV when the status is DELETE', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'DELETE',
          TOTALPERMTEMP: 2,
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0]).to.be.undefined;
      });
    });

    it('should validate the total number of staff with the # of staff provided in the Worker CSV when the status is NOCHANGE', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'NOCHANGE',
          TOTALPERMTEMP: 2,
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0].warning).to.deep.equal(
          'TOTALPERMTEMP (Total staff and the number of worker records) does not match',
        );
      });
    });

    it('should show a warning when number of starters > total workers', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'UPDATE',
          STARTERS: '1;1;1',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        const warnings = [];
        for (let error of csvEstablishmentSchemaErrors) {
          warnings.push(error.warning);
        }

        expect(warnings).to.include(
          'STARTERS data you have entered does not fall within the expected range please ensure this is correct',
        );
      });
    });

    it('should show a warning when number of leavers >= total workers', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'UPDATE',
          LEAVERS: '1;1;1',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        const warnings = [];
        for (let error of csvEstablishmentSchemaErrors) {
          warnings.push(error.warning);
        }

        expect(warnings).to.include(
          'LEAVERS data you have entered does not fall within the expected range please ensure this is correct',
        );
      });
    });

    it('should show a warning when number of vacancies >= total workers', async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'UPDATE',
          VACANCIES: '1;1;1',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        const warnings = [];
        for (let error of csvEstablishmentSchemaErrors) {
          warnings.push(error.warning);
        }

        expect(warnings).to.include(
          'VACANCIES data you have entered does not fall within the expected range please ensure this is correct',
        );
      });
    });

    it("should not show a warning when starters, leavers or vacancies contains the 999 don't know magic string", async () => {
      const establishmentRow = buildEstablishmentCSV({
        overrides: {
          STATUS: 'UPDATE',
          STARTERS: '999;0;0',
          LEAVERS: '0;999;0',
          VACANCIES: '0;0;999',
        },
      });

      const workerRow = buildWorkerCSV({
        overrides: {
          LOCALESTID: establishmentRow.LOCALESTID,
        },
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors).to.be.empty;
      });
    });
    it('should show a warning when number of leavers !== REASONNOS', async () => {
      const establishmentRow = buildEstablishmentCSV();
      establishmentRow.ALLJOBROLES = '22';
      establishmentRow.LEAVERS = '2';
      establishmentRow.STARTERS = '0';
      establishmentRow.VACANCIES = '0';
      establishmentRow.REASONS = '21;22';
      establishmentRow.REASONNOS = '3;5';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);

      expect(establishment.validationErrors).to.deep.equal([
        {
          origin: 'Establishments',
          lineNumber: establishment.lineNumber,
          errCode: 1360,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'The total number of REASONNOS you have entered does not equal the total number of LEAVERS',
          source: '3;5 (8) - 2 (2)',
          column: 'REASONNOS/LEAVERS',
          name: establishmentRow.LOCALESTID,
        },
      ]);
    });
  });
  describe('toCSV', () => {
    beforeEach(() => {
      sandbox.stub(BUDI, 'establishmentType').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'serviceUsers').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'jobRoles').callsFake((method, value) => value);
    });

    it('should return basic CSV info in expected order', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[0]).to.equal(establishment.LocalIdentifierValue);
      expect(csvAsArray[1]).to.equal('UNCHECKED');
      expect(csvAsArray[2]).to.equal(establishment.NameValue);
      expect(csvAsArray[3]).to.equal(establishment.address1);
      expect(csvAsArray[4]).to.equal(establishment.address2);
      expect(csvAsArray[5]).to.equal(establishment.address3);
      expect(csvAsArray[6]).to.equal(establishment.town);
      expect(csvAsArray[7]).to.equal(establishment.postcode);
    });

    it('should return more CSV info', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[8]).to.equal(establishment.EmployerTypeValue.toString());
      expect(csvAsArray[9]).to.equal(establishment.EmployerTypeOther.toString());
    });

    it('should have 0s in PERMCQC, PERMLACSV and REGTYPE columns when shareWithCQC, shareWithLA and isRegulated are false', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[10]).to.equal('0');
      expect(csvAsArray[11]).to.equal('0');
      expect(csvAsArray[13]).to.equal('0');
    });

    it('should have 1s in PERMCQC, PERMLACSV and 2 in REGTYPE column when shareWithCQC, shareWithLA and isRegulated are true', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.shareWithCQC = true;
      establishment.shareWithLA = true;
      establishment.isRegulated = true;
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[10]).to.equal('1');
      expect(csvAsArray[11]).to.equal('1');
      expect(csvAsArray[13]).to.equal('2');
    });

    it('should have the same number in MAINSERVICE column and ALLSERVICES column', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[17]).to.include(csvAsArray[16]);
    });

    it('should include all reporting IDs from other services in ALLSERVICES column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.otherServices = [{ reportingID: 23 }, { reportingID: 12 }];
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[17]).to.include('23');
      expect(csvAsArray[17]).to.include('12');
    });

    it('should put correct number of staff in TOTALPERMTEMP column', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[23]).to.equal(establishment.NumberOfStaffValue.toString());
    });

    it('should include all reporting IDs from other services in ALLSERVICES column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.otherServices = [{ reportingID: 23 }, { reportingID: 12 }];
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[17]).to.include('23');
      expect(csvAsArray[17]).to.include('12');
    });

    it('should store NumberOfStaffValue in TOTALPERMTEMP column', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[23]).to.include(establishment.NumberOfStaffValue);
    });

    it('should store capacity in the CAPACITY column and utilisation in the UTILISATION column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.otherServices = [
        { reportingID: 23, id: 23 },
        { reportingID: 12, id: 12 },
      ];
      establishment.capacity = [
        {
          answer: 2,
          reference: {
            type: 'Capacity',
            service: {
              id: 23,
            },
          },
        },
        {
          answer: 3,
          reference: {
            type: 'Utilisation',
            service: {
              id: 12,
            },
          },
        },
      ];
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[18]).to.include(';' + establishment.capacity[0].answer + ';');
      expect(csvAsArray[19]).to.include(';;' + establishment.capacity[1].answer);
    });

    it('should include all other descriptions from other services in SERVICEDESC column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.otherServices = [
        { reportingID: 23, establishmentServices: { other: 'Care without care' } },
        { reportingID: 12, establishmentServices: { other: 'Caring less' } },
      ];
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[20]).to.include(establishment.otherServices[1].establishmentServices.other);
      expect(csvAsArray[20]).to.include(establishment.otherServices[2].establishmentServices.other);
    });

    it('should include all service users in SERVICEUSERS column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.serviceUsers = [
        {
          id: 2,
        },
      ];
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[21]).to.include(establishment.serviceUsers[0].id);
    });

    it('should include all service users in SERVICEUSERS column and OTHERUSERDESC if theres an other', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.serviceUsers = [
        {
          id: 2,
          establishmentServiceUsers: {
            other: 'This is a service user',
          },
        },
      ];
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[21]).to.include(establishment.serviceUsers[0].id);
      expect(csvAsArray[22]).to.include(establishment.serviceUsers[0].establishmentServiceUsers.other);
    });

    it('should include all jobs users in ALLJOBROLES column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.jobs = [
        {
          jobId: 7,
        },
        {
          jobId: 16,
        },
      ];
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[24]).to.include(establishment.jobs[0].jobId);
      expect(csvAsArray[24]).to.include(establishment.jobs[1].jobId);
    });

    it('should include all jobs users in ALLJOBROLES, STARTERS, LEAVERS and VACANCIES column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.jobs = [
        {
          jobId: 7,
          type: 'Starters',
          total: 2,
        },
        {
          jobId: 16,
          type: 'Starters',
          total: 4,
        },
        {
          jobId: 16,
          type: 'Leavers',
          total: 1,
        },
        {
          jobId: 18,
          type: 'Vacancies',
          total: 12,
        },
      ];
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[24]).to.include(establishment.jobs[0].jobId);
      expect(csvAsArray[24]).to.include(establishment.jobs[1].jobId);
      expect(csvAsArray[24]).to.include(establishment.jobs[2].jobId);
      expect(csvAsArray[24]).to.include(establishment.jobs[3].jobId);
      expect(csvAsArray[25]).to.include(establishment.jobs[0].total);
      expect(csvAsArray[25]).to.include(establishment.jobs[1].total);
      expect(csvAsArray[26]).to.include(establishment.jobs[2].total);
      expect(csvAsArray[27]).to.include(establishment.jobs[3].total);
    });

    ['Starters', 'Leavers', 'Vacancies'].forEach((slv, index) => {
      it(`should show 999 if "Don't know" the value of ${slv} in ${slv.toUpperCase()} column`, async () => {
        const column = 25 + index;
        const establishment = apiEstablishmentBuilder();
        establishment[`${slv}Value`] = "Don't know";

        const csv = establishmentCsv.toCSV(establishment);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[column]).to.include('999');
      });

      it(`should show nothing if null the value of ${slv} in ${slv.toUpperCase()} column`, async () => {
        const column = 25 + index;
        const establishment = apiEstablishmentBuilder();
        establishment[`${slv}Value`] = null;

        const csv = establishmentCsv.toCSV(establishment);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[column]).to.deep.equal('');
      });

      it(`should show 0 if "None" the value of ${slv} in ${slv.toUpperCase()} column`, async () => {
        const column = 25 + index;
        const establishment = apiEstablishmentBuilder();
        establishment[`${slv}Value`] = 'None';

        const csv = establishmentCsv.toCSV(establishment);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[column]).to.include('0');
      });
    });

    it('should include reasons for leaving in REASONS and REASONNOS column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.reasonsForLeaving = '34:|18:Hello|29:Test';
      const csv = establishmentCsv.toCSV(establishment);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[28]).to.include('34');
      expect(csvAsArray[28]).to.include('18');
      expect(csvAsArray[29]).to.include('Hello');
      expect(csvAsArray[28]).to.include('29');
      expect(csvAsArray[29]).to.include('Test');
    });
  });
});
