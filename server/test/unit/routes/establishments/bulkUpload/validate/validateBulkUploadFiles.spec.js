const expect = require('chai').expect;
const {
  createKeysForWorkers,
  createWorkerKey,
  worksOverNationalInsuranceMaximum,
} = require('../../../../../../routes/establishments/bulkUpload/validate/validateBulkUploadFiles');

describe('validateBulkUploadFiles', () => {
  describe('createWorkerKey', () => {
    it('should return key with local and uniqueWorker concatenated', async () => {
      const worker = { local: 'mockWorkplace', uniqueWorker: 'testUser' };

      const workerKey = createWorkerKey(worker.local, worker.uniqueWorker);

      expect(workerKey).to.equal('mockWorkplacetestUser');
    });

    it('should return key with local and uniqueWorker concatenated with whitespace removed', async () => {
      const worker = { local: 'Workplace With Spaces', uniqueWorker: 'Test User' };

      const workerKey = createWorkerKey(worker.local, worker.uniqueWorker);

      expect(workerKey).to.equal('WorkplaceWithSpacesTestUser');
    });
  });

  describe('createKeysForWorkers', () => {
    it('should return array of keys with local and uniqueWorker concatenated', async () => {
      const workers = [
        { local: 'Another Test Workplace', uniqueWorker: 'User 1' },
        { local: 'The Place', uniqueWorker: 'User 2' },
      ];

      const workerKeys = createKeysForWorkers(workers);

      expect(workerKeys[0]).to.equal('AnotherTestWorkplaceUser1');
      expect(workerKeys[1]).to.equal('ThePlaceUser2');
    });
  });

  describe('worksOverNationalInsuranceMaximum', () => {
    it('should return false when only one occurence of worker with hours below NI maximum', async () => {
      const worker = { weeklyContractedHours: 35, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' };

      const workers = [{ weeklyContractedHours: 35, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' }];

      expect(worksOverNationalInsuranceMaximum(worker, workers)).to.be.false;
    });

    it('should return true when only one occurence of worker with hours above NI maximum', async () => {
      const worker = { weeklyContractedHours: 35, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' };

      const workers = [{ weeklyContractedHours: null, weeklyAverageHours: 68, nationalInsuranceNumber: 'ABC' }];

      expect(worksOverNationalInsuranceMaximum(worker, workers)).to.be.true;
    });

    it('should return false when two occurences of worker(same NINO) with hours below NI maximum', async () => {
      const worker = { weeklyContractedHours: 35, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' };

      const workers = [
        { weeklyContractedHours: 35, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' },
        { weeklyContractedHours: 45, weeklyAverageHours: null, nationalInsuranceNumber: 'DifferentNINO' },
        { weeklyContractedHours: 13, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' },
      ];

      expect(worksOverNationalInsuranceMaximum(worker, workers)).to.be.false;
    });

    it('should return true when two occurences of worker(same NINO) with hours above NI maximum', async () => {
      const worker = { weeklyContractedHours: 35, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' };

      const workers = [
        { weeklyContractedHours: 35, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' },
        { weeklyContractedHours: 41, weeklyAverageHours: null, nationalInsuranceNumber: 'ABC' },
      ];

      expect(worksOverNationalInsuranceMaximum(worker, workers)).to.be.true;
    });
  });
});
