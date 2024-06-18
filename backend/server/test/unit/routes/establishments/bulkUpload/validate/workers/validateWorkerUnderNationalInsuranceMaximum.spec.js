const expect = require('chai').expect;
const {
  worksOverNationalInsuranceMaximum,
  validateWorkerUnderNationalInsuranceMaximum,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateWorkerUnderNationalInsuranceMaximum');

describe('validateWorkerUnderNationalInsuranceMaximum', () => {
  it('should add error when two occurences of worker(same NINO) with hours above NI maximum', () => {
    const worker = {
      hours: { contractedHours: 35 },
      niNumber: 'ABC',
      lineNumber: 2,
      localId: 'A123456',
      uniqueWorkerId: 'Martin',
    };
    const workers = [worker, { hours: { contractedHours: 41 }, niNumber: 'ABC' }];
    const csvWorkerSchemaErrors = [];

    validateWorkerUnderNationalInsuranceMaximum(worker, workers, csvWorkerSchemaErrors);

    expect(csvWorkerSchemaErrors[0]).to.deep.equal({
      origin: 'Workers',
      lineNumber: worker.lineNumber,
      errCode: 5570,
      errType: 'NI_WORKER_DUPLICATE_ERROR',
      error: 'NINUMBER is already associated with another full time worker record',
      source: worker.localId,
      column: 'NINUMBER',
      worker: worker.uniqueWorkerId,
      name: worker.localId,
    });
  });

  it('should not modify csvWorkerSchemaErrors when hours are below NI maximum', () => {
    const worker = { niNumber: 'ABC', hours: { contractedHours: 35 } };
    const workers = [worker];
    const csvWorkerSchemaErrors = [];

    validateWorkerUnderNationalInsuranceMaximum(worker, workers, csvWorkerSchemaErrors);

    expect(csvWorkerSchemaErrors).to.deep.equal([]);
  });

  describe('worksOverNationalInsuranceMaximum', () => {
    const worker = { niNumber: 'ABC', hours: { contractedHours: 35 } };

    it('should return false when only one occurence of worker with hours below NI maximum', async () => {
      const workers = [{ niNumber: 'ABC', hours: { contractedHours: 35 } }];

      expect(worksOverNationalInsuranceMaximum(worker, workers)).to.be.false;
    });

    it('should return true when only one occurence of worker with hours above NI maximum', async () => {
      const workers = [{ hours: { averageHours: 68 }, niNumber: 'ABC' }];

      expect(worksOverNationalInsuranceMaximum(worker, workers)).to.be.true;
    });

    it('should return false when two occurences of worker(same NINO) with hours below NI maximum', async () => {
      const workers = [
        { hours: { contractedHours: 35 }, niNumber: 'ABC' },
        { hours: { contractedHours: 45 }, niNumber: 'DifferentNINO' },
        { hours: { contractedHours: 13 }, niNumber: 'ABC' },
      ];

      expect(worksOverNationalInsuranceMaximum(worker, workers)).to.be.false;
    });

    it('should return true when two occurences of worker(same NINO) with hours above NI maximum', async () => {
      const workers = [
        { hours: { contractedHours: 35 }, niNumber: 'ABC' },
        { hours: { contractedHours: 41 }, niNumber: 'ABC' },
      ];

      expect(worksOverNationalInsuranceMaximum(worker, workers)).to.be.true;
    });

    it('should return false when workers have NINO undefined with hours above NI maximum', async () => {
      const workerNoNi = { hours: { contractedHours: 35 } };

      const workers = [{ hours: { contractedHours: 35 } }, { hours: { contractedHours: 41 } }];

      expect(worksOverNationalInsuranceMaximum(workerNoNi, workers)).to.be.false;
    });
  });
});
