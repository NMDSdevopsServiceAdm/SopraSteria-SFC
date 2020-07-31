const expect = require('chai').expect;
const BUDI = require('../../../../../models/BulkImport/BUDI').BUDI;
const buildEstablishmentCSV = require('../../../../factories/establishment/csv');
const buildWorkerCSV = require('../../../../factories/worker/csv');
const establishmentCsv = require('../../../../../models/BulkImport/csv/establishments');
const workerCsv = require('../../../../../models/BulkImport/csv/workers');
const models = require('../../../../../models');
const sandbox = require('sinon').createSandbox();

const generateWorkerFromCsv = (currentLine, lineNumber = 1, allCurrentEstablishments = []) => {
  const worker = new workerCsv.Worker(currentLine, lineNumber, allCurrentEstablishments);
  worker.validate();

  return worker;
};

const generateEstablishmentFromCsv = async (currentLine, lineNumber = 1, allCurrentEstablishments = []) => {
  const establishment = new establishmentCsv.Establishment(currentLine, lineNumber, allCurrentEstablishments);
  await establishment.validate();

  return establishment;
};

const crossValidate = async (establishmentRow, workerRow, callback) => {
  const establishment = await generateEstablishmentFromCsv(establishmentRow);

  const myWorkers = [
    generateWorkerFromCsv(workerRow),
  ];

  const csvEstablishmentSchemaErrors = [];

  const fetchMyEstablishmentsWorkers = sandbox.spy(async () => {
    return [];
  });

  await establishment.crossValidate({
    csvEstablishmentSchemaErrors,
    myWorkers,
    fetchMyEstablishmentsWorkers,
  });

  callback(csvEstablishmentSchemaErrors);
}

describe('Bulk Upload - Establishment CSV', () => {
  beforeEach(() => {
    sandbox.stub(BUDI, 'initialize');
    sandbox.stub(models.pcodedata, 'findAll').returns([]);
    sandbox.stub(models.establishment, 'findAll').returns([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Cross Validations', () => {
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
        }
      });

      crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0].warning).to.deep.equal(`Total staff and the number of worker records does not match for ${establishmentRow.ESTNAME}`);
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
        }
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0].warning).to.deep.equal(`Total staff and the number of worker records does not match for ${establishmentRow.ESTNAME}`);
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
        }
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0].warning).to.deep.equal(`Total staff and the number of worker records does not match for ${establishmentRow.ESTNAME}`);
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
        }
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
        }
      });

      await crossValidate(establishmentRow, workerRow, (csvEstablishmentSchemaErrors) => {
        expect(csvEstablishmentSchemaErrors[0]).to.be.undefined;
      });
    });
  });
});
