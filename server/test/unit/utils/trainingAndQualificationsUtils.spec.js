const expect = require('chai').expect;
const {
  getTrainingTotals,
  convertQualificationsForEstablishments,
} = require('../../../utils/trainingAndQualificationsUtils');
const {
  mockWorkerTrainingBreakdowns,
  mockEstablishmentsQualificationsResponse,
} = require('../mockdata/trainingAndQualifications');

describe('trainingAndQualificationsUtils', () => {
  describe('getTrainingTotals', () => {
    it('should return object with sums of all worker training records', () => {
      const result = getTrainingTotals(mockWorkerTrainingBreakdowns);

      expect(result.total.totalRecords).to.equal(35);
      expect(result.total.mandatory).to.equal(11);
      expect(result.total.nonMandatory).to.equal(24);
    });

    it('should return object with sums of up to date worker training records', () => {
      const result = getTrainingTotals(mockWorkerTrainingBreakdowns);

      expect(result.upToDate.total).to.equal(15);
      expect(result.upToDate.mandatory).to.equal(5);
      expect(result.upToDate.nonMandatory).to.equal(10);
    });

    it('should return object with sums of Expiring soon worker training records', () => {
      const result = getTrainingTotals(mockWorkerTrainingBreakdowns);

      expect(result.expiringSoon.total).to.equal(8);
      expect(result.expiringSoon.mandatory).to.equal(2);
      expect(result.expiringSoon.nonMandatory).to.equal(6);
    });

    it('should return object with sums of Expired worker training records', () => {
      const result = getTrainingTotals(mockWorkerTrainingBreakdowns);

      expect(result.expired.total).to.equal(12);
      expect(result.expired.mandatory).to.equal(4);
      expect(result.expired.nonMandatory).to.equal(8);
    });

    it('should return object with sums of Missing worker training records', () => {
      const result = getTrainingTotals(mockWorkerTrainingBreakdowns);

      expect(result.missing).to.equal(5);
    });
  });

  describe('convertQualificationsForEstablishments', () => {
    describe('First establishment', async () => {
      it('should return the workplace name for the first establishment', () => {
        const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);

        expect(result[0].name).to.deep.equal('Workplace Name');
      });

      it('should return the converted qualification for the first worker', () => {
        const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);
        expect(result[0].qualifications[0]).to.deep.equal({
          workerName: 'Bob Ross',
          jobRole: 'Activities worker or co-ordinator',
          qualificationType: 'NVQ',
          qualificationName: 'Care NVQ',
          qualificationLevel: '3',
          yearAchieved: 2020,
        });
      });

      it('should return the converted qualification for the second worker when first has only one qualification', () => {
        const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);
        expect(result[0].qualifications[1]).to.deep.equal({
          workerName: 'Martin Mill',
          jobRole: 'Care Giver',
          qualificationType: 'Award',
          qualificationName: 'Good Name Award',
          qualificationLevel: '2',
          yearAchieved: 2018,
        });
      });
    });

    describe('Second establishment', async () => {
      it('should return the workplace name for the second establishment', () => {
        const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);

        expect(result[1].name).to.deep.equal('Subsidiary Workplace Name');
      });

      it('should return the first converted qualification for the first worker', () => {
        const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);
        expect(result[1].qualifications[0]).to.deep.equal({
          workerName: 'Roly Poly',
          jobRole: 'Roll Connoisseur',
          qualificationType: 'Degree',
          qualificationName: 'Rolling',
          qualificationLevel: '6',
          yearAchieved: 2020,
        });
      });

      it('should return the second converted qualification for the first worker when more than qualification', () => {
        const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);
        expect(result[1].qualifications[1]).to.deep.equal({
          workerName: 'Roly Poly',
          jobRole: 'Roll Connoisseur',
          qualificationType: 'Degree',
          qualificationName: 'Rolling Masters',
          qualificationLevel: '7',
          yearAchieved: 2021,
        });
      });
    });
  });
});
