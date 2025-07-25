const expect = require('chai').expect;
const BUDI = require('../../../../../models/BulkImport/BUDI').BUDI;
const buildEstablishmentCSV = require('../../../../factories/establishment/csv');
const buildWorkerCSV = require('../../../../factories/worker/csv');
const WorkplaceCSVValidator =
  require('../../../../../models/BulkImport/csv/workplaceCSVValidator').WorkplaceCSVValidator;
const Establishment = require('../../../../../models/classes/establishment').Establishment;
const WorkerCsvValidator =
  require('../../../../../../../lambdas/bulkUpload/classes/workerCSVValidator.js').WorkerCsvValidator;
const mappings = require('../../../../../models/BulkImport/BUDI').mappings;

const models = require('../../../../../models');
const sandbox = require('sinon').createSandbox();
const { apiEstablishmentBuilder } = require('../../../../integration/utils/establishment');
const pCodeCheck = require('../../../../../utils/postcodeSanitizer');

const workplaceMappings = {
  cwpAwareness: [
    { id: 1, bulkUploadCode: '1' },
    { id: 2, bulkUploadCode: '2' },
    { id: 3, bulkUploadCode: '3' },
    { id: 4, bulkUploadCode: '4' },
    { id: 5, bulkUploadCode: '999' },
  ],
  cwpUseReason: [
    { id: 1, bulkUploadCode: '1' },
    { id: 2, bulkUploadCode: '2' },
    { id: 3, bulkUploadCode: '3' },
    { id: 4, bulkUploadCode: '4' },
    { id: 5, bulkUploadCode: '5' },
    { id: 6, bulkUploadCode: '6' },
    { id: 7, bulkUploadCode: '7' },
    { id: 8, bulkUploadCode: '8' },
    { id: 9, bulkUploadCode: '9' },
    { id: 10, bulkUploadCode: '10' },
  ],
};

const validateAPIObject = (establishmentRow) => {
  return {
    address1: establishmentRow.ADDRESS1,
    address2: establishmentRow.ADDRESS2,
    address3: '',
    town: establishmentRow.POSTTOWN,
    postcode: establishmentRow.POSTCODE,
    locationId: establishmentRow.LOCATIONID,
    provId: establishmentRow.PROVNUM,
    isCQCRegulated: true,
    reasonsForLeaving: '',
    status: 'NEW',
    name: establishmentRow.ESTNAME,
    localIdentifier: establishmentRow.LOCALESTID,
    isRegulated: true,
    employerType: { value: 'Private Sector', other: undefined },
    mainService: 8,
    services: { value: 'Yes', services: [{ id: 8 }, { id: 13 }] },
    serviceUsers: [],
    numberOfStaff: 1,
    vacancies: [999, 333, 1],
    starters: [0, 0, 0],
    leavers: [999, 0, 0],
    shareWith: { cqc: true, localAuthorities: true },
    capacities: [0, 0, 0, 0],
    doNewStartersRepeatMandatoryTrainingFromPreviousEmployment: 1,
    wouldYouAcceptCareCertificatesFromPreviousEmployment: 2,
    careWorkforcePathwayWorkplaceAwareness: '',
    careWorkforcePathwayUse: null,
    careWorkersCashLoyaltyForFirstTwoYears: '200',
    sickPay: 0,
    pensionContribution: 1,
    careWorkersLeaveDaysPerYear: '35',
  };
};
const generateWorkerFromCsv = (currentLine, lineNumber = 1, allCurrentEstablishments = []) => {
  const worker = new WorkerCsvValidator(currentLine, lineNumber, allCurrentEstablishments, mappings);
  worker.validate();

  return worker.toJSON(true);
};

const generateEstablishmentFromCsv = async (currentLine, lineNumber = 1, allCurrentEstablishments = []) => {
  const establishment = new WorkplaceCSVValidator(currentLine, lineNumber, allCurrentEstablishments, workplaceMappings);

  await establishment.validate();

  return establishment;
};

const crossValidate = async (establishmentRow, workerRow, callback, databaseWorkers = []) => {
  const establishment = await generateEstablishmentFromCsv(establishmentRow);

  const myWorkers = [generateWorkerFromCsv(workerRow)];

  const csvEstablishmentSchemaErrors = [];

  sandbox.stub(Establishment, 'fetchMyEstablishmentsWorkers').returns(databaseWorkers);

  await establishment.crossValidate(csvEstablishmentSchemaErrors, myWorkers);

  callback(csvEstablishmentSchemaErrors);
};

describe('Bulk Upload - Establishment CSV', () => {
  let establishmentRow;

  beforeEach(() => {
    establishmentRow = buildEstablishmentCSV();
    sandbox.stub(BUDI, 'initialize');
    sandbox.stub(WorkplaceCSVValidator.prototype, '_validateNoChange').callsFake(() => {
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
      const establishment = await generateEstablishmentFromCsv(establishmentRow);

      const apiObject = establishment.toAPI();
      expect(apiObject).to.deep.equal(validateAPIObject(establishmentRow));
    });
    it('should return a correct all services if ; added on the end ', async () => {
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

    describe('CQC Regulated', () => {
      it('should return isCQCRegulated as false when set to 0 in CSV', async () => {
        establishmentRow.REGTYPE = '0';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        const apiObject = establishment.toAPI();

        expect(apiObject.isCQCRegulated).to.equal(false);
      });

      it('should set isCQCRegulated as false when column empty in CSV', async () => {
        establishmentRow.REGTYPE = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        const apiObject = establishment.toAPI();

        expect(apiObject.isCQCRegulated).to.equal(false);
      });

      it('should set isCQCRegulated as true when set to 2 in CSV', async () => {
        establishmentRow.REGTYPE = '2';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        const apiObject = establishment.toAPI();

        expect(apiObject.isCQCRegulated).to.equal(true);
      });
    });

    describe('Address fields', () => {
      it('should return address fields in CSV', async () => {
        establishmentRow.ADDRESS1 = 'First Address';
        establishmentRow.ADDRESS2 = 'Second Address';
        establishmentRow.ADDRESS3 = 'Third Address';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        const apiObject = establishment.toAPI();

        expect(apiObject.address1).to.deep.equal('First Address');
        expect(apiObject.address2).to.deep.equal('Second Address');
        expect(apiObject.address3).to.deep.equal('Third Address');
      });

      it('should return town and postcode fields from CSV', async () => {
        establishmentRow.POSTTOWN = 'Wonderland';
        establishmentRow.POSTCODE = 'CT11AB';
        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        const apiObject = establishment.toAPI();

        expect(apiObject.postcode).to.deep.equal('CT11AB');
        expect(apiObject.town).to.deep.equal('Wonderland');
      });
    });

    describe('shareWith', () => {
      it('should return cqc and localAuthorities as true when set as 1 in CSV', async () => {
        establishmentRow.PERMCQC = '1';
        establishmentRow.PERMLA = '1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        const apiObject = establishment.toAPI();

        const expectedShareWith = { cqc: true, localAuthorities: true };

        expect(apiObject.shareWith).to.deep.equal(expectedShareWith);
      });

      it('should return cqc and localAuthorities as false when set as 0 in CSV', async () => {
        establishmentRow.PERMCQC = '0';
        establishmentRow.PERMLA = '0';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        const apiObject = establishment.toAPI();

        const expectedShareWith = { cqc: false, localAuthorities: false };

        expect(apiObject.shareWith).to.deep.equal(expectedShareWith);
      });

      it('should return cqc and localAuthorities as null when empty in CSV', async () => {
        establishmentRow.PERMCQC = '';
        establishmentRow.PERMLA = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        const apiObject = establishment.toAPI();

        const expectedShareWith = { cqc: null, localAuthorities: null };

        expect(apiObject.shareWith).to.deep.equal(expectedShareWith);
      });
    });

    describe('repeatTraining', () => {
      it("should return 'Yes, always' when 1 in CSV", async () => {
        establishmentRow.REPEATTRAINING = '1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment).to.equal('Yes, always');
      });

      it("should return 'Yes, very often' when 2 in CSV", async () => {
        establishmentRow.REPEATTRAINING = '2';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment).to.equal('Yes, very often');
      });

      it("should return 'Yes, but not very often' when 3 in CSV", async () => {
        establishmentRow.REPEATTRAINING = '3';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment).to.equal(
          'Yes, but not very often',
        );
      });

      it("should return 'No, never' when 4 in CSV", async () => {
        establishmentRow.REPEATTRAINING = '4';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment).to.equal('No, never');
      });

      it('should return null when empty in CSV', async () => {
        establishmentRow.REPEATTRAINING = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment).to.equal(null);
      });
    });

    describe('acceptCareCert', () => {
      it("should return 'Yes, always' when 1 in CSV", async () => {
        establishmentRow.ACCEPTCARECERT = '1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.wouldYouAcceptCareCertificatesFromPreviousEmployment).to.equal('Yes, always');
      });

      it("should return 'Yes, very often' when 2 in CSV", async () => {
        establishmentRow.ACCEPTCARECERT = '2';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.wouldYouAcceptCareCertificatesFromPreviousEmployment).to.equal('Yes, very often');
      });

      it("should return 'Yes, but not very often' when 3 in CSV", async () => {
        establishmentRow.ACCEPTCARECERT = '3';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.wouldYouAcceptCareCertificatesFromPreviousEmployment).to.equal('Yes, but not very often');
      });

      it("should return 'No, never' when 4 in CSV", async () => {
        establishmentRow.ACCEPTCARECERT = '4';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.wouldYouAcceptCareCertificatesFromPreviousEmployment).to.equal('No, never');
      });

      it('should return null when empty in CSV', async () => {
        establishmentRow.ACCEPTCARECERT = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.wouldYouAcceptCareCertificatesFromPreviousEmployment).to.equal(null);
      });
    });

    describe('careWorkforcePathwayAwareness', () => {
      workplaceMappings.cwpAwareness.forEach((mapping) => {
        it(`should return id mapping (${mapping.id}) of bulkUploadCode (${mapping.bulkUploadCode})`, async () => {
          establishmentRow.CWPAWARE = mapping.bulkUploadCode;

          const establishment = await generateEstablishmentFromCsv(establishmentRow);
          establishment.transform();
          const apiObject = establishment.toAPI();

          expect(apiObject.careWorkforcePathwayWorkplaceAwareness).to.deep.equal({ id: mapping.id });
        });
      });

      it('should return null when no answer provided', async () => {
        establishmentRow.CWPAWARE = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.careWorkforcePathwayWorkplaceAwareness).to.equal(null);
      });
    });
  });

  describe('careWorkforcePathwayUse', () => {
    const testCases = [
      {
        bulkUploadInput: '1',
        expectedValue: { use: 'Yes', reasons: [] },
      },
      {
        bulkUploadInput: '1;1;2',
        expectedValue: { use: 'Yes', reasons: [{ id: 1 }, { id: 2 }] },
      },
      {
        bulkUploadInput: '1;2;3;2;3;5',
        expectedValue: { use: 'Yes', reasons: [{ id: 2 }, { id: 3 }, { id: 5 }] },
      },
      {
        bulkUploadInput: '1;555',
        expectedValue: { use: 'Yes', reasons: [] },
      },
      {
        bulkUploadInput: '1;555;2',
        expectedValue: { use: 'Yes', reasons: [{ id: 2 }] },
      },
      {
        bulkUploadInput: '2',
        expectedValue: { use: 'No', reasons: [] },
      },
      {
        bulkUploadInput: '2;1;2',
        expectedValue: { use: 'No', reasons: [] },
      },
      {
        bulkUploadInput: '999',
        expectedValue: { use: "Don't know", reasons: [] },
      },
    ];

    testCases.forEach(({ bulkUploadInput, expectedValue }) => {
      const reasonAsString = JSON.stringify(expectedValue.reasons);
      it(`should set cwpUse as (${expectedValue.use}) and reasons as (${reasonAsString}) when bulk upload input is (${bulkUploadInput})`, async () => {
        establishmentRow.CWPUSE = bulkUploadInput;

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        establishment.transform();
        const apiObject = establishment.toAPI();

        expect(apiObject.careWorkforcePathwayUse).to.deep.equal(expectedValue);
      });
    });

    it('should keep cwpUse as null when no answer provided', async () => {
      establishmentRow.CWPUSE = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkforcePathwayUse).to.equal(null);
    });
  });

  describe('careWorkforcePathwayUse description (free text for reason "Something else")', () => {
    it('should add a description when CWPUSEDESC has input value and CWPUSE is 1 (Yes) with reason 10', async () => {
      establishmentRow.CWPUSE = '1;1;2;10';
      establishmentRow.CWPUSEDESC = 'some description';

      const expectedValue = { use: 'Yes', reasons: [{ id: 1 }, { id: 2 }, { id: 10, other: 'some description' }] };

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkforcePathwayUse).to.deep.equal(expectedValue);
    });

    it('should not set the description when CWPUSEDESC has input value but reason 10 is not selected', async () => {
      establishmentRow.CWPUSE = '1;1;2';
      establishmentRow.CWPUSEDESC = 'some description';

      const expectedValue = { use: 'Yes', reasons: [{ id: 1 }, { id: 2 }] };

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkforcePathwayUse).to.deep.equal(expectedValue);
    });

    it('should not set the description when CWPUSEDESC is given but CWPUSE is not "Yes"', async () => {
      establishmentRow.CWPUSE = '2';
      establishmentRow.CWPUSEDESC = 'some description';

      const expectedValue = { use: 'No', reasons: [] };

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkforcePathwayUse).to.deep.equal(expectedValue);
    });
  });

  describe('benefit', () => {
    it('should return the value when a number in CSV', async () => {
      establishmentRow.BENEFITS = '200';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkersCashLoyaltyForFirstTwoYears).to.equal('200');
    });

    it("should return 'Yes' when 1; in CSV", async () => {
      establishmentRow.BENEFITS = '1;';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkersCashLoyaltyForFirstTwoYears).to.equal('Yes');
    });

    it("should return 'Yes' when 1 in CSV", async () => {
      establishmentRow.BENEFITS = '1';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkersCashLoyaltyForFirstTwoYears).to.equal('Yes');
    });

    it("should return \"Don't know\" when 'unknown' in CSV", async () => {
      establishmentRow.BENEFITS = 'unknown';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkersCashLoyaltyForFirstTwoYears).to.equal("Don't know");
    });

    it("should return 'No' when 0 in CSV", async () => {
      establishmentRow.BENEFITS = '0';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkersCashLoyaltyForFirstTwoYears).to.equal('No');
    });

    it('should return null when empty in CSV', async () => {
      establishmentRow.BENEFITS = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkersCashLoyaltyForFirstTwoYears).to.equal('');
    });
  });

  describe('sickPay', () => {
    it("should return 'Yes' when 1 in CSV", async () => {
      establishmentRow.SICKPAY = '1';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.sickPay).to.equal('Yes');
    });

    it("should return \"Don't know\" when 'unknown' in CSV", async () => {
      establishmentRow.SICKPAY = 'unknown';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.sickPay).to.equal("Don't know");
    });

    it("should return 'No' when 0 in CSV", async () => {
      establishmentRow.SICKPAY = '0';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.sickPay).to.equal('No');
    });

    it('should return null when empty in CSV', async () => {
      establishmentRow.SICKPAY = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.sickPay).to.equal(null);
    });
  });

  describe('Pension contribution', () => {
    it("should return 'Yes' when 1 in CSV", async () => {
      establishmentRow.PENSION = '1';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.pensionContribution).to.equal('Yes');
    });

    it("should return \"Don't know\" when 'unknown' in CSV", async () => {
      establishmentRow.PENSION = 'unknown';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.pensionContribution).to.equal("Don't know");
    });

    it("should return 'No' when 0 in CSV", async () => {
      establishmentRow.PENSION = '0';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.pensionContribution).to.equal('No');
    });

    it('should return null when empty in CSV', async () => {
      establishmentRow.PENSION = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.pensionContribution).to.equal(null);
    });
  });

  describe('Holiday Leave', () => {
    it('should return the value when a number in CSV', async () => {
      establishmentRow.HOLIDAY = '35';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkersLeaveDaysPerYear).to.equal('35');
    });

    it('should return empty when empty in CSV', async () => {
      establishmentRow.HOLIDAY = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      establishment.transform();
      const apiObject = establishment.toAPI();

      expect(apiObject.careWorkersLeaveDaysPerYear).to.equal('');
    });
  });

  describe('toJSON', () => {
    it('should return a correct JSON ', async () => {
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
    it('should return no errors when given valid CSV', async () => {
      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      expect(establishment.validationErrors).to.deep.equal([]);
    });

    describe('address', () => {
      const MAX_LENGTH = 40;
      const overFortyCharactersText = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry';

      it('should return an error if ADDRESS1 is blank', async () => {
        establishmentRow.ADDRESS1 = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1040,
            errType: 'ADDRESS_ERROR',
            error: 'ADDRESS1 is blank',
            column: 'ADDRESS1',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should return an error if ADDRESS1 has more than the max length of characters', async () => {
        establishmentRow.ADDRESS1 = overFortyCharactersText;

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1040,
            errType: 'ADDRESS_ERROR',
            error: `ADDRESS1 is longer than ${MAX_LENGTH} characters`,
            column: 'ADDRESS1',
            name: establishmentRow.LOCALESTID,
            source: overFortyCharactersText,
          },
        ]);
      });

      it('should return an error if ADDRESS2 has more than the max length of characters', async () => {
        establishmentRow.ADDRESS2 = overFortyCharactersText;

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1045,
            errType: 'ADDRESS_ERROR',
            error: `ADDRESS2 is longer than ${MAX_LENGTH} characters`,
            column: 'ADDRESS2',
            name: establishmentRow.LOCALESTID,
            source: overFortyCharactersText,
          },
        ]);
      });

      it('should return an error if ADDRESS3 has more than the max length of characters', async () => {
        establishmentRow.ADDRESS3 = overFortyCharactersText;

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1050,
            errType: 'ADDRESS_ERROR',
            error: `ADDRESS3 is longer than ${MAX_LENGTH} characters`,
            column: 'ADDRESS3',
            name: establishmentRow.LOCALESTID,
            source: overFortyCharactersText,
          },
        ]);
      });

      it('should return an error if POSTTOWN has more than the max length of characters', async () => {
        establishmentRow.POSTTOWN = overFortyCharactersText;

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1055,
            errType: 'ADDRESS_ERROR',
            error: `POSTTOWN is longer than ${MAX_LENGTH} characters`,
            column: 'POSTTOWN',
            name: establishmentRow.LOCALESTID,
            source: overFortyCharactersText,
          },
        ]);
      });

      it('should return an error if POSTCODE is blank', async () => {
        establishmentRow.POSTCODE = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1060,
            errType: 'ADDRESS_ERROR',
            error: 'POSTCODE has not been supplied',
            column: 'POSTCODE',
            name: establishmentRow.LOCALESTID,
            source: '',
          },
        ]);
      });

      it('should return an error if POSTCODE has more than the max length of characters', async () => {
        const POSTCODE_MAX_LENGTH = 10;
        const postcodeString = 'Lorem Ipsum';
        establishmentRow.POSTCODE = postcodeString;

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1060,
            errType: 'ADDRESS_ERROR',
            error: `POSTCODE is longer than ${POSTCODE_MAX_LENGTH} characters`,
            column: 'POSTCODE',
            name: establishmentRow.LOCALESTID,
            source: postcodeString,
          },
        ]);
      });

      it('should return an error if sanitisePostcode returns null', async () => {
        const postcodeString = 'Lorem Ip';
        establishmentRow.POSTCODE = postcodeString;

        sandbox.stub(pCodeCheck, 'sanitisePostcode').returns(null);

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1060,
            errType: 'ADDRESS_ERROR',
            error: 'POSTCODE is incorrectly formatted',
            column: 'POSTCODE',
            name: establishmentRow.LOCALESTID,
            source: postcodeString,
          },
        ]);
      });

      it('should return an error if status is NEW and POSTCODE does not exist', async () => {
        const postcodeString = 'Z81 2RD';

        const establishmentRow = buildEstablishmentCSV({
          overrides: {
            POSTCODE: postcodeString,
            STATUS: 'NEW',
          },
        });

        sandbox.restore();
        sandbox.stub(models.pcodedata, 'findAll').returns([]);
        sandbox.stub(models.establishment, 'findAll').returns([]);

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1060,
            errType: 'ADDRESS_ERROR',
            error: 'The POSTCODE for this workplace cannot be found in our database and must be registered manually.',
            column: 'POSTCODE',
            name: establishmentRow.LOCALESTID,
            source: postcodeString,
          },
        ]);
      });

      it('should return an error if status is UPDATE and POSTCODE does not exist', async () => {
        const postcodeString = 'Z81 2RD';

        const establishmentRow = buildEstablishmentCSV({
          overrides: {
            id: 1,
            POSTCODE: postcodeString,
            STATUS: 'UPDATE',
            LOCALESTID: 'main',
          },
        });

        sandbox.restore();
        sandbox.stub(models.pcodedata, 'findAll').returns([]);
        sandbox.stub(models.establishment, 'findAll').returns([]);

        const establishment = await generateEstablishmentFromCsv(
          establishmentRow,
          (lineNumber = 1),
          (allCurrentEstablishments = [
            {
              id: 1,
              uid: '123-414',
              key: 'main',
            },
          ]),
        );

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 1060,
            warnType: 'ADDRESS_ERROR',
            warning: 'The POSTCODE cannot be found in our database and will be ignored.',
            column: 'POSTCODE',
            name: establishmentRow.LOCALESTID,
            source: postcodeString,
          },
        ]);
      });
    });

    it('should validate ALLSERVICES if MAINSERVICE is not included ', async () => {
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

    it('should throw an error if ALLSERVICES has a 0 and an other service', async () => {
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
      establishmentRow.ALLJOBROLES = '';
      establishmentRow.STARTERS = '';
      establishmentRow.LEAVERS = '';
      establishmentRow.VACANCIES = '';

      const establishment = await generateEstablishmentFromCsv(establishmentRow);
      expect(establishment.validationErrors).to.deep.equal([]);
    });

    describe('repeatTraining', () => {
      it('should validate and pass if there is no input', async () => {
        establishmentRow.REPEATTRAINING = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 1 input', async () => {
        establishmentRow.REPEATTRAINING = '1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 2 is input', async () => {
        establishmentRow.REPEATTRAINING = '2';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 3 is input', async () => {
        establishmentRow.REPEATTRAINING = '3';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 4 is input', async () => {
        establishmentRow.REPEATTRAINING = '4';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and return a warning if a number outside of the allowed values is input', async () => {
        establishmentRow.REPEATTRAINING = '5';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2420,
            warnType: 'REPEAT_TRAINING_WARNING',
            warning: 'The code you have entered for REPEATTRAINING is incorrect and will be ignored',
            source: '5',
            column: 'REPEATTRAINING',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return a warning if an invalid string is input', async () => {
        establishmentRow.REPEATTRAINING = 'asdf';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2420,
            warnType: 'REPEAT_TRAINING_WARNING',
            warning: 'The code you have entered for REPEATTRAINING is incorrect and will be ignored',
            source: 'asdf',
            column: 'REPEATTRAINING',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });
    });

    describe('acceptCareCertificate', () => {
      it('should validate and pass if there is no input', async () => {
        establishmentRow.ACCEPTCARECERT = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 1 input', async () => {
        establishmentRow.ACCEPTCARECERT = '1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 2 is input', async () => {
        establishmentRow.ACCEPTCARECERT = '2';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 3 is input', async () => {
        establishmentRow.ACCEPTCARECERT = '3';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 4 is input', async () => {
        establishmentRow.ACCEPTCARECERT = '4';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and return a warning if a number outside of the allowed values is input', async () => {
        establishmentRow.ACCEPTCARECERT = '5';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2430,
            warnType: 'ACCEPT_CARE_CERT_WARNING',
            warning: 'The code you have entered for ACCEPTCARECERT is incorrect and will be ignored',
            source: '5',
            column: 'ACCEPTCARECERT',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return a warning if an invalid string is input', async () => {
        establishmentRow.ACCEPTCARECERT = 'asdf';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2430,
            warnType: 'ACCEPT_CARE_CERT_WARNING',
            warning: 'The code you have entered for ACCEPTCARECERT is incorrect and will be ignored',
            source: 'asdf',
            column: 'ACCEPTCARECERT',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });
    });

    describe('careWorkforcePathwayAware', () => {
      it('should pass if there is no input', async () => {
        establishmentRow.CWPAWARE = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      workplaceMappings.cwpAwareness.forEach((mapping) => {
        it(`should pass if input is bulkUploadCode in mappings: ${mapping.bulkUploadCode}`, async () => {
          establishmentRow.CWPAWARE = mapping.bulkUploadCode;

          const establishment = await generateEstablishmentFromCsv(establishmentRow);
          expect(establishment.validationErrors).to.deep.equal([]);
        });
      });

      ['asdf', '23'].forEach((invalidInput) => {
        it(`should return warning if input is invalid (${invalidInput})`, async () => {
          establishmentRow.CWPAWARE = invalidInput;

          const establishment = await generateEstablishmentFromCsv(establishmentRow);
          expect(establishment.validationErrors).to.deep.equal([
            {
              origin: 'Establishments',
              lineNumber: establishment.lineNumber,
              warnCode: 2480,
              warnType: 'CWPAWARE_WARNING',
              warning: 'The code you have entered for CWPAWARE is incorrect and will be ignored',
              source: invalidInput,
              column: 'CWPAWARE',
              name: establishmentRow.LOCALESTID,
            },
          ]);
        });
      });
    });

    describe('careWorkforcePathwayUse _validateCwpUse()', () => {
      it('should pass if there is no input', async () => {
        establishmentRow.CWPUSE = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      const validInputs = ['1', '1;1;2;3;10', '2', '999'];

      validInputs.forEach((validInput) => {
        it(`should pass if input is valid: ${validInput}`, async () => {
          establishmentRow.CWPUSE = validInput;

          const establishment = await generateEstablishmentFromCsv(establishmentRow);
          expect(establishment.validationErrors).to.deep.equal([]);
        });
      });

      const invalidCases = ['test1234', '78', ';', ';1;2'];

      invalidCases.forEach((inputValue) => {
        it(`should return warning if input cwp use value is invalid (${inputValue})`, async () => {
          establishmentRow.CWPUSE = inputValue;

          const establishment = await generateEstablishmentFromCsv(establishmentRow);
          expect(establishment.validationErrors).to.deep.equal([
            {
              origin: 'Establishments',
              lineNumber: establishment.lineNumber,
              warnCode: 2490,
              warnType: 'CWPUSE_WARNING',
              warning: 'The code you have entered for CWPUSE is incorrect and will be ignored',
              source: inputValue,
              column: 'CWPUSE',
              name: establishmentRow.LOCALESTID,
            },
          ]);
        });
      });

      it("should return warning if input cwp use reason value is invalid ('1;789')", async () => {
        establishmentRow.CWPUSE = '1;789';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2490,
            warnType: 'CWPUSE_WARNING',
            warning: 'The code you have entered for CWPUSE reason is incorrect and will be ignored',
            source: '1;789',
            column: 'CWPUSE',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });
    });

    describe('careWorkforcePathway use description  _validateCwpUseDesc', () => {
      it('should pass if there is no input for CWPUSEDESC', async () => {
        establishmentRow.CWPUSEDESC = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      const testCasesForCwpUseThatShouldHaveWarning = ['1;2;3', '1', '2', '999', ''];

      testCasesForCwpUseThatShouldHaveWarning.forEach((cwpUseInput) => {
        it(`should return warning if there are some text input in CWPUSEDESC but CWPUSE (${cwpUseInput}) does not have reason 10 (something else)`, async () => {
          establishmentRow.CWPUSE = cwpUseInput;
          establishmentRow.CWPUSEDESC = 'some text';

          const establishment = await generateEstablishmentFromCsv(establishmentRow);
          expect(establishment.validationErrors).to.deep.equal([
            {
              origin: 'Establishments',
              lineNumber: establishment.lineNumber,
              warnCode: 2500,
              warnType: 'CWPUSEDESC_WARNING',
              warning: 'CWPUSEDESC will be ignored as 10 is not selected as a reason for CWPUSE',
              source: 'some text',
              column: 'CWPUSEDESC',
              name: establishmentRow.LOCALESTID,
            },
          ]);
        });
      });

      it('should return warning if the CWPUSEDESC is longer than 120 characters', async () => {
        establishmentRow.CWPUSE = '1;2;10';
        establishmentRow.CWPUSEDESC =
          'a very very very very long sentence a very very very very long sentence ' +
          'a very very very very long sentence a very very very very long sentence ';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2500,
            warnType: 'CWPUSEDESC_WARNING',
            warning: 'CWPUSEDESC is longer than 120 characters and will be ignored',
            source: establishmentRow.CWPUSEDESC,
            column: 'CWPUSEDESC',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should pass if CWPUSEDESC has input and CWPUSE is 1 with reason 10', async () => {
        establishmentRow.CWPUSE = '1;2;10';
        establishmentRow.CWPUSEDESC = 'some text';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });
    });

    describe('benefit', () => {
      it('should validate and pass if there is no input', async () => {
        establishmentRow.BENEFITS = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if a postive whole number is input', async () => {
        establishmentRow.BENEFITS = '200';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if a postive number (2 dp) is input', async () => {
        establishmentRow.BENEFITS = '200.39';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 0 is input', async () => {
        establishmentRow.BENEFITS = '0';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 1 is input', async () => {
        establishmentRow.BENEFITS = '1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });
      it('should validate and pass if 1; is input', async () => {
        establishmentRow.BENEFITS = '1;';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it("should validate and pass if 'unknown' is input", async () => {
        establishmentRow.BENEFITS = 'unknown';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it("should validate and pass if 'UNKNOWN' is input", async () => {
        establishmentRow.BENEFITS = 'UNKNOWN';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and return an warning if an invalid string is input', async () => {
        establishmentRow.BENEFITS = 'asdf';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2440,
            warnType: 'BENEFITS_WARNING',
            warning: 'The code you have entered for BENEFITS is incorrect and will be ignored',
            source: 'asdf',
            column: 'BENEFITS',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return an error if a negative number is input', async () => {
        establishmentRow.BENEFITS = '-1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2440,
            warnType: 'BENEFITS_WARNING',
            warning: 'The code you have entered for BENEFITS is incorrect and will be ignored',
            source: '-1',
            column: 'BENEFITS',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return an error if a negative number is input', async () => {
        establishmentRow.BENEFITS = '134.3457890';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2440,
            warnType: 'BENEFITS_WARNING',
            warning: 'The code you have entered for BENEFITS is incorrect and will be ignored',
            source: '134.3457890',
            column: 'BENEFITS',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });
    });

    describe('sickPay', () => {
      it('should validate and pass if there is no input', async () => {
        establishmentRow.SICKPAY = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 0 is input', async () => {
        establishmentRow.SICKPAY = '0';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 1 is input', async () => {
        establishmentRow.SICKPAY = '1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it("should validate and pass if 'unknown' is input", async () => {
        establishmentRow.SICKPAY = 'unknown';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it("should validate and pass if 'UNKNOWN' is input", async () => {
        establishmentRow.SICKPAY = 'UNKNOWN';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and return an warning if an invalid string is input', async () => {
        establishmentRow.SICKPAY = 'asdf';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2450,
            warnType: 'SICKPAY_WARNING',
            warning: 'The code you have entered for SICKPAY is incorrect and will be ignored',
            source: 'asdf',
            column: 'SICKPAY',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return an error if a negative number is input', async () => {
        establishmentRow.SICKPAY = '-1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2450,
            warnType: 'SICKPAY_WARNING',
            warning: 'The code you have entered for SICKPAY is incorrect and will be ignored',
            source: '-1',
            column: 'SICKPAY',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return an error if a decimal number is input', async () => {
        establishmentRow.SICKPAY = '134.3457890';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2450,
            warnType: 'SICKPAY_WARNING',
            warning: 'The code you have entered for SICKPAY is incorrect and will be ignored',
            source: '134.3457890',
            column: 'SICKPAY',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });
    });

    describe('pension', () => {
      it('should validate and pass if there is no input', async () => {
        establishmentRow.SICKPAY = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 0 is input', async () => {
        establishmentRow.PENSION = '0';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if 1 is input', async () => {
        establishmentRow.PENSION = '1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it("should validate and pass if 'unknown' is input", async () => {
        establishmentRow.PENSION = 'unknown';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it("should validate and pass if 'UNKNOWN' is input", async () => {
        establishmentRow.PENSION = 'UNKNOWN';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and return an warning if an invalid string is input', async () => {
        establishmentRow.PENSION = 'asdf';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2460,
            warnType: 'PENSION_WARNING',
            warning: 'The code you have entered for PENSION is incorrect and will be ignored',
            source: 'asdf',
            column: 'PENSION',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return an error if a negative number is input', async () => {
        establishmentRow.PENSION = '-1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2460,
            warnType: 'PENSION_WARNING',
            warning: 'The code you have entered for PENSION is incorrect and will be ignored',
            source: '-1',
            column: 'PENSION',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return an error if a decimal number is input', async () => {
        establishmentRow.PENSION = '134.3457890';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2460,
            warnType: 'PENSION_WARNING',
            warning: 'The code you have entered for PENSION is incorrect and will be ignored',
            source: '134.3457890',
            column: 'PENSION',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });
    });

    describe('holiday', () => {
      it('should validate and pass if there is no input', async () => {
        establishmentRow.HOLIDAY = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and pass if a postive whole number is input', async () => {
        establishmentRow.HOLIDAY = '200';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([]);
      });

      it('should validate and return an warning if an invalid string is input', async () => {
        establishmentRow.HOLIDAY = 'asdf';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2470,
            warnType: 'HOLIDAY_WARNING',
            warning: 'The code you have entered for HOLIDAY is incorrect and will be ignored',
            source: 'asdf',
            column: 'HOLIDAY',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return an error if a negative number is input', async () => {
        establishmentRow.HOLIDAY = '-1';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2470,
            warnType: 'HOLIDAY_WARNING',
            warning: 'The code you have entered for HOLIDAY is incorrect and will be ignored',
            source: '-1',
            column: 'HOLIDAY',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should validate and return an error if a decimal number is input', async () => {
        establishmentRow.HOLIDAY = '134.3457890';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);
        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            warnCode: 2470,
            warnType: 'HOLIDAY_WARNING',
            warning: 'The code you have entered for HOLIDAY is incorrect and will be ignored',
            source: '134.3457890',
            column: 'HOLIDAY',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });
    });

    describe('shareWith', () => {
      it('should produce error if PERMCQC is a number which is not 0 or 1', async () => {
        establishmentRow.PERMCQC = '3';
        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1080,
            errType: 'SHARE_WITH_CQC_ERROR',
            error: 'The code you have entered for PERMCQC is incorrect',
            source: '3',
            column: 'PERMCQC',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should produce error if PERMLA contains text', async () => {
        establishmentRow.PERMLA = 'a';
        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([
          {
            origin: 'Establishments',
            lineNumber: establishment.lineNumber,
            errCode: 1090,
            errType: 'SHARE_WITH_LA_ERROR',
            error: 'The code you have entered for PERMLA is incorrect',
            source: 'a',
            column: 'PERMLA',
            name: establishmentRow.LOCALESTID,
          },
        ]);
      });

      it('should not produce error if PERMLA or PERMCQC is an empty string', async () => {
        establishmentRow.PERMLA = '';
        establishmentRow.PERMCQC = '';

        const establishment = await generateEstablishmentFromCsv(establishmentRow);

        expect(establishment.validationErrors).to.deep.equal([]);
      });
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
    xit('should NOT show error if not Head Office and registered manager is UNCHECKED ', async () => {
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
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
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
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[8]).to.equal(establishment.EmployerTypeValue.toString());
      expect(csvAsArray[9]).to.equal(establishment.EmployerTypeOther.toString());
    });

    it('should have 0s in PERMCQC, PERMLA and REGTYPE columns when shareWithCQC, shareWithLA and isRegulated are false', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[10]).to.equal('0');
      expect(csvAsArray[11]).to.equal('0');
      expect(csvAsArray[12]).to.equal('0');
    });

    it('should have 1s in PERMCQC, PERMLA and 2 in REGTYPE column when shareWithCQC, shareWithLA and isRegulated are true', async () => {
      const establishment = apiEstablishmentBuilder({
        overrides: {
          shareWithCQC: true,
          shareWithLA: true,
          isRegulated: true,
        },
      });

      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[10]).to.equal('1');
      expect(csvAsArray[11]).to.equal('1');
      expect(csvAsArray[12]).to.equal('2');
    });

    it('should have empty strings in PERMCQC and PERMLA when shareWithCQC and shareWithLA are null', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.shareWithCQC = null;
      establishment.shareWithLA = null;

      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[10]).to.equal('');
      expect(csvAsArray[11]).to.equal('');
    });

    it('should have the same number in MAINSERVICE column and ALLSERVICES column', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[16]).to.include(csvAsArray[16]);
    });

    it('should include all reporting IDs from other services in ALLSERVICES column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.otherServices = [{ reportingID: 23 }, { reportingID: 12 }];
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[16]).to.include('23');
      expect(csvAsArray[16]).to.include('12');
    });

    it('should put correct number of staff in TOTALPERMTEMP column', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[22]).to.equal(establishment.NumberOfStaffValue.toString());
    });

    it('should include all reporting IDs from other services in ALLSERVICES column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.otherServices = [{ reportingID: 23 }, { reportingID: 12 }];
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[16]).to.include('23');
      expect(csvAsArray[16]).to.include('12');
    });

    it('should store NumberOfStaffValue in TOTALPERMTEMP column', async () => {
      const establishment = apiEstablishmentBuilder();
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[22]).to.include(establishment.NumberOfStaffValue);
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
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[17]).to.include(';' + establishment.capacity[0].answer + ';');
      expect(csvAsArray[18]).to.include(';;' + establishment.capacity[1].answer);
    });

    it('should include all other descriptions from other services in SERVICEDESC column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.otherServices = [
        { reportingID: 23, establishmentServices: { other: 'Care without care' } },
        { reportingID: 12, establishmentServices: { other: 'Caring less' } },
      ];
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[19]).to.include(establishment.otherServices[1].establishmentServices.other);
      expect(csvAsArray[19]).to.include(establishment.otherServices[2].establishmentServices.other);
    });

    it('should include all service users in SERVICEUSERS column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.serviceUsers = [
        {
          id: 2,
        },
      ];
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[20]).to.include(establishment.serviceUsers[0].id);
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
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[20]).to.include(establishment.serviceUsers[0].id);
      expect(csvAsArray[21]).to.include(establishment.serviceUsers[0].establishmentServiceUsers.other);
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
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[23]).to.include(establishment.jobs[0].jobId);
      expect(csvAsArray[23]).to.include(establishment.jobs[1].jobId);
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
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[23]).to.include(establishment.jobs[0].jobId);
      expect(csvAsArray[23]).to.include(establishment.jobs[1].jobId);
      expect(csvAsArray[23]).to.include(establishment.jobs[2].jobId);
      expect(csvAsArray[23]).to.include(establishment.jobs[3].jobId);
      expect(csvAsArray[24]).to.include(establishment.jobs[0].total);
      expect(csvAsArray[24]).to.include(establishment.jobs[1].total);
      expect(csvAsArray[25]).to.include(establishment.jobs[2].total);
      expect(csvAsArray[26]).to.include(establishment.jobs[3].total);
    });

    ['Starters', 'Leavers', 'Vacancies'].forEach((slv, index) => {
      it(`should show 999 if "Don't know" the value of ${slv} in ${slv.toUpperCase()} column`, async () => {
        const column = 24 + index;
        const establishment = apiEstablishmentBuilder();
        establishment.jobs = [
          {
            jobId: 7,
          },
          {
            jobId: 16,
          },
        ];
        establishment[`${slv}Value`] = "Don't know";

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[column]).to.include('999');
      });

      it(`should show nothing if null the value of ${slv} in ${slv.toUpperCase()} column`, async () => {
        const column = 24 + index;
        const establishment = apiEstablishmentBuilder();
        establishment[`${slv}Value`] = null;

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[column]).to.deep.equal('');
      });

      it(`should show 0 if there are no jobs and if "None" is the value of ${slv} in ${slv.toUpperCase()} column`, async () => {
        const column = 24 + index;
        const establishment = apiEstablishmentBuilder();
        establishment[`${slv}Value`] = 'None';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[column]).to.deep.equal('0');
      });

      it(`should show 0 for each job if "None" the value of ${slv} in ${slv.toUpperCase()} column`, async () => {
        const column = 24 + index;
        const establishment = apiEstablishmentBuilder();
        establishment.jobs = [
          {
            jobId: 7,
          },
          {
            jobId: 16,
          },
        ];
        establishment[`${slv}Value`] = 'None';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[column]).to.deep.equal('0;0');
      });
    });

    it('should include reasons for leaving in REASONS and REASONNOS column', async () => {
      const establishment = apiEstablishmentBuilder();
      establishment.reasonsForLeaving = '34:|18:Hello|29:Test';
      const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
      const csvAsArray = csv.split(',');

      expect(csvAsArray[27]).to.include('34');
      expect(csvAsArray[27]).to.include('18');
      expect(csvAsArray[27]).to.include('29');
      expect(csvAsArray[28]).to.include('Hello');
      expect(csvAsArray[28]).to.include('Test');
    });

    describe('REPEATTRAINNG and ACCEPTCARECERT', () => {
      const repeatTrainingIndex = 29;
      const acceptCareCertIndex = 30;

      it('should leave the REPEATTRAINNG and ACCEPTCARECERT columns blank if there values are null', async () => {
        const establishment = apiEstablishmentBuilder();

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[repeatTrainingIndex]).to.equal('');
        expect(csvAsArray[acceptCareCertIndex]).to.equal('');
      });

      it("should include '1' in REPEATTRAINNG and ACCEPTCARECERT columns blank if there values are 'Yes, always'", async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = 'Yes, always';
        establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment = 'Yes, always';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[repeatTrainingIndex]).to.include(1);
        expect(csvAsArray[acceptCareCertIndex]).to.include(1);
      });

      it("should include '2' in REPEATTRAINNG and ACCEPTCARECERT columns blank if there values are 'Yes, very often'", async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = 'Yes, very often';
        establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment = 'Yes, very often';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[repeatTrainingIndex]).to.include(2);
        expect(csvAsArray[acceptCareCertIndex]).to.include(2);
      });

      it("should include '3' in REPEATTRAINNG and ACCEPTCARECERT columns blank if there values are 'Yes, but not very often'", async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = 'Yes, but not very often';
        establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment = 'Yes, but not very often';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[repeatTrainingIndex]).to.include(3);
        expect(csvAsArray[acceptCareCertIndex]).to.include(3);
      });

      it("should include '4' in REPEATTRAINNG and ACCEPTCARECERT columns blank if there values are 'No, never'", async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = 'No, never';
        establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment = 'No, never';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[repeatTrainingIndex]).to.include(4);
        expect(csvAsArray[acceptCareCertIndex]).to.include(4);
      });
    });

    describe('CWPAWARENESS', () => {
      const cwpIndex = 31;

      it('should leave the CWPAWARENESS column blank if value is null', async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkforcePathwayWorkplaceAwarenessFK = null;

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[cwpIndex]).to.equal('');
      });

      workplaceMappings.cwpAwareness.forEach((mapping) => {
        it('should map from careWorkforcePathwayWorkplaceAwarenessFK to BU code provided in workplaceMappings', () => {
          const establishment = apiEstablishmentBuilder();
          establishment.careWorkforcePathwayWorkplaceAwareness = mapping;

          const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[cwpIndex]).to.equal(mapping.bulkUploadCode);
        });
      });
    });

    describe('CWPUSE', () => {
      const cwpUseIndex = WorkplaceCSVValidator.headers()
        .split(',')
        .findIndex((columnName) => columnName === 'CWPUSE');

      it('should leave the CWPUSE column blank if value is null', async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkforcePathwayUse = null;

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[cwpUseIndex]).to.equal('');
      });

      const testCases = [
        {
          bulkUploadValue: '1',
          databaseValue: { use: 'Yes', reasons: [] },
        },
        {
          bulkUploadValue: '1;1;2',
          databaseValue: {
            use: 'Yes',
            reasons: [
              { id: 1, bulkUploadCode: 1 },
              { id: 2, bulkUploadCode: 2 },
            ],
          },
        },
        {
          bulkUploadValue: '2',
          databaseValue: { use: 'No', reasons: [] },
        },
        {
          bulkUploadValue: '999',
          databaseValue: { use: "Don't know", reasons: [] },
        },
      ];

      testCases.forEach(({ bulkUploadValue, databaseValue }) => {
        it('should map from careWorkforcePathwayUse to BU code format of CWPUSE', () => {
          const establishment = apiEstablishmentBuilder();
          establishment.careWorkforcePathwayUse = databaseValue.use;
          establishment.CareWorkforcePathwayReasons = databaseValue.reasons;

          const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[cwpUseIndex]).to.equal(bulkUploadValue);
        });
      });
    });

    describe('CWPUSEDESC', () => {
      const cwpUseDescIndex = WorkplaceCSVValidator.headers()
        .split(',')
        .findIndex((columnName) => columnName === 'CWPUSEDESC');

      it('should leave the CWPUSEDESC column blank if cwp use is null', async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkforcePathwayUse = null;

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[cwpUseDescIndex]).to.equal('');
      });

      it('should leave the CWPUSEDESC column blank if cwp use is "No"', async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkforcePathwayUse = 'No';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[cwpUseDescIndex]).to.equal('');
      });

      it('should leave the CWPUSEDESC column blank if cwp use has reason that is not "something else"', async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkforcePathwayUse = 'Yes';
        establishment.CareWorkforcePathwayReasons = [
          {
            id: 1,
            bulkUploadCode: 1,
            isOther: false,
          },
        ];

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[cwpUseDescIndex]).to.equal('');
      });

      it('should fill in the reason text to CWPUSEDESC column if cwp use has "something else" selected with text', async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkforcePathwayUse = 'Yes';
        establishment.CareWorkforcePathwayReasons = [
          {
            id: 10,
            bulkUploadCode: 10,
            isOther: true,
            EstablishmentCWPReasons: { other: 'description text for something else' },
          },
        ];

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[cwpUseDescIndex]).to.equal('description text for something else');
      });
    });

    describe('BENEFITS, SICKPAY, PENSION and HOLIDAY', () => {
      const benefitsIndex = WorkplaceCSVValidator.headers()
        .split(',')
        .findIndex((columnName) => columnName === 'BENEFITS');

      const sickPayIndex = benefitsIndex + 1;
      const pensionIndex = benefitsIndex + 2;
      const holidayIndex = benefitsIndex + 3;

      it('should leave the BENEFITS, SICKPAY and  PENSION columns blank if there values are null', async () => {
        const establishment = apiEstablishmentBuilder();

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[benefitsIndex]).to.equal('');
        expect(csvAsArray[sickPayIndex]).to.equal('');
        expect(csvAsArray[pensionIndex]).to.equal('');
      });

      it("should include 0 in the BENEFITS ,SICKPAY and PENSION columns if there values are 'No'", async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkersCashLoyaltyForFirstTwoYears = 'No';
        establishment.sickPay = 'No';
        establishment.pensionContribution = 'No';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[benefitsIndex]).to.include(0);
        expect(csvAsArray[sickPayIndex]).to.include(0);
        expect(csvAsArray[pensionIndex]).to.include(0);
      });

      it("should include 'unknown' in the BENEFITS ,SICKPAY and PENSION columns if there values are \"Don't know\"", async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkersCashLoyaltyForFirstTwoYears = "Don't know";
        establishment.sickPay = "Don't know";
        establishment.pensionContribution = "Don't know";

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[benefitsIndex]).to.include('unknown');
        expect(csvAsArray[sickPayIndex]).to.include('unknown');
        expect(csvAsArray[pensionIndex]).to.include('unknown');
      });

      it("should include 1 in the BENEFITS ,SICKPAY and PENSION columns if there values are 'Yes'", async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkersCashLoyaltyForFirstTwoYears = 'Yes';
        establishment.sickPay = 'Yes';
        establishment.pensionContribution = 'Yes';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[benefitsIndex]).to.include('1;');
        expect(csvAsArray[sickPayIndex]).to.include('1');
        expect(csvAsArray[pensionIndex]).to.include('1');
      });

      it('should include a value in the columns BENEFITS and  HOLIDAY if it they have  values', async () => {
        const establishment = apiEstablishmentBuilder();
        establishment.careWorkersCashLoyaltyForFirstTwoYears = '200';
        establishment.careWorkersLeaveDaysPerYear = '35';

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[benefitsIndex]).to.include('200');
        expect(csvAsArray[holidayIndex]).to.include('35');
      });

      it('should leave the  HOLIDAY column blank if its value  is null', async () => {
        const establishment = apiEstablishmentBuilder();

        const csv = WorkplaceCSVValidator.toCSV(establishment, workplaceMappings);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[holidayIndex]).to.equal('');
      });
    });
  });
});
