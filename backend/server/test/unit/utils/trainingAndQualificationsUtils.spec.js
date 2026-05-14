const expect = require('chai').expect;
const dayjs = require('dayjs');
const {
  getTrainingTotals,
  convertQualificationsForEstablishments,
  convertWorkersWithCareCertificateStatus,
  convertTrainingForEstablishments,
  getTrainingRecordStatus,
  numberCheck,
  listMissingMandatoryTrainings,
  listAllExistingAndMissingTrainings,
  buildTrainingCategorySummary,
} = require('../../../utils/trainingAndQualificationsUtils');
const {
  mockWorkerTrainingBreakdowns,
  mockEstablishmentsQualificationsResponse,
  mockEstablishmentsCareCertificateResponse,
  mockEstablishmentsTrainingResponse,
  mockWorkerTrainingRecords,
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

  describe('convertWorkersWithCareCertificateStatus', () => {
    describe('First establishment', async () => {
      it('should return the workplace name for the first establishment', () => {
        const result = convertWorkersWithCareCertificateStatus(mockEstablishmentsCareCertificateResponse);

        expect(result[0].establishmentName).to.deep.equal('Care Home 1');
      });

      it('should return the converted worker care certificate status object for first worker in the first establishment', () => {
        const result = convertWorkersWithCareCertificateStatus(mockEstablishmentsCareCertificateResponse);
        expect(result[0].workers[0]).to.deep.equal({
          workerId: 'Bob Ross',
          jobRole: 'Care Worker',
          status: 'No',
        });
      });

      it('should return the converted worker care certificate status object for second worker in the first establishment', () => {
        const result = convertWorkersWithCareCertificateStatus(mockEstablishmentsCareCertificateResponse);
        expect(result[0].workers[1]).to.deep.equal({
          workerId: 'Mike Mill',
          jobRole: 'Care Coordinator',
          status: 'Yes, in progress or partially completed',
        });
      });
    });

    describe('Second establishment', async () => {
      it('should return the workplace name for the second establishment', () => {
        const result = convertWorkersWithCareCertificateStatus(mockEstablishmentsCareCertificateResponse);

        expect(result[1].establishmentName).to.deep.equal('Care Home 2');
      });

      it('should return the converted worker care certificate status object for first worker in the second establishment', () => {
        const result = convertWorkersWithCareCertificateStatus(mockEstablishmentsCareCertificateResponse);
        expect(result[1].workers[0]).to.deep.equal({
          workerId: 'Bill Bailey',
          jobRole: 'Care Worker',
          status: 'Yes, completed',
        });
      });

      it('should return the converted worker care certificate status object for second worker in the second establishment', () => {
        const result = convertWorkersWithCareCertificateStatus(mockEstablishmentsCareCertificateResponse);
        expect(result[1].workers[1]).to.deep.equal({
          workerId: 'Jenny Jones',
          jobRole: 'Care Worker',
          status: 'No',
        });
      });
    });
  });

  describe('convertTrainingForEstablishments', () => {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
    const after90Days = dayjs().add(90, 'days').format('YYYY-MM-DD');
    const after89Days = dayjs().add(89, 'days').format('YYYY-MM-DD');

    describe('First establishment', async () => {
      it('should return array with first establishment name', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);

        expect(result[0].name).to.equal('Nursing Home');
      });

      it('should return a string if number in string', () => {
        mockEstablishmentsTrainingResponse[0].NameValue = '80abc';
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);

        expect(result[0].name).to.equal('80abc');
      });

      it('should return a string if number in string with letters', () => {
        mockEstablishmentsTrainingResponse[0].NameValue = '80abc';
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);

        expect(typeof result[0].name).to.deep.equal('string');
      });

      it('should return a number if only number in string', () => {
        mockEstablishmentsTrainingResponse[0].NameValue = '80';
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);

        expect(typeof result[0].name).to.deep.equal('number');
        expect(result[0].name).to.deep.equal(80);
      });

      it('should return worker details formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);
        const firstWorker = result[0].workerRecords[0];

        expect(firstWorker.workerId).to.equal('New staff record');
        expect(firstWorker.jobRole).to.equal('Activities worker or co-ordinator');
        expect(firstWorker.longTermAbsence).to.equal('');
        expect(firstWorker.mandatoryTraining).to.deep.equal(['Communication skills']);
      });

      it('should return first training record formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);
        const firstWorkerFirstTrainingRecord = result[0].workerRecords[0].trainingRecords[0];

        expect(firstWorkerFirstTrainingRecord).to.deep.equal({
          category: 'Dementia care',
          categoryFK: 10,
          trainingName: 'Great',
          expiryDate: new Date(yesterday),
          status: 'Expired',
          dateCompleted: new Date('2020-01-01T00:00:00.000Z'),
          accredited: 'No',

          isMandatory: 'No',
          deliveredBy: 'External provider',
          howWasItDelivered: 'Face to face',
          trainingCertificateUploaded: 'Yes',
          trainingProviderName: 'Care skill training',
          validityPeriodInMonth: 24,
        });
      });

      it('should return second training record formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);
        const firstWorkerSecondTrainingRecord = result[0].workerRecords[0].trainingRecords[1];

        expect(firstWorkerSecondTrainingRecord).to.deep.equal({
          category: 'Old age care',
          categoryFK: 5,
          trainingName: 'Old age care training',
          expiryDate: new Date(after90Days),
          status: 'Up-to-date',
          dateCompleted: new Date('2020-01-01T00:00:00.000Z'),
          accredited: 'Yes',

          isMandatory: 'No',
          deliveredBy: 'In-house staff',
          howWasItDelivered: 'Face to face',
          trainingCertificateUploaded: 'No',
          trainingProviderName: null,
          validityPeriodInMonth: 12,
        });
      });

      it('should return worker details formatted as expected for second worker', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);
        const secondWorker = result[0].workerRecords[1];

        expect(secondWorker.workerId).to.equal('Another staff record');
        expect(secondWorker.jobRole).to.equal('Care giver');
        expect(secondWorker.longTermAbsence).to.equal('Yes');
        expect(secondWorker.mandatoryTraining).to.deep.equal(['Learning']);
      });

      it('should return first training record formatted as expected for second worker', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);
        const secondWorkerFirstTrainingRecord = result[0].workerRecords[1].trainingRecords[0];

        expect(secondWorkerFirstTrainingRecord).to.deep.equal({
          category: 'Learning',
          categoryFK: 10,
          trainingName: 'Test Training',
          expiryDate: new Date(after89Days),
          status: 'Expiring soon',
          dateCompleted: new Date('2020-01-01T00:00:00.000Z'),
          accredited: 'No',

          isMandatory: 'Yes',
          validityPeriodInMonth: null,
          trainingCertificateUploaded: 'No',
          deliveredBy: 'External provider',
          trainingProviderName: null,
          howWasItDelivered: 'E-learning',
        });
      });

      it('should add an "missingMandatoryTrainings" field to each worker', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);
        const firstWorker = result[0].workerRecords[0];
        const secondWorker = result[0].workerRecords[1];

        expect(firstWorker.missingMandatoryTrainings).to.deep.equal([
          {
            category: 'Communication skills',
            status: 'Missing',
            isMandatory: 'Yes',
          },
        ]);

        expect(secondWorker.missingMandatoryTrainings).to.deep.equal([]);
      });
    });

    describe('convertQualificationsForEstablishments', () => {
      describe('First establishment', async () => {
        it('should return array with first establishment name', () => {
          const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);

          expect(result[0].name).to.equal('Workplace Name');
        });

        it('should return a string if number in string', () => {
          mockEstablishmentsQualificationsResponse[0].NameValue = '80abc';
          const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);

          expect(result[0].name).to.equal('80abc');
        });

        it('should return a string if number in string with letters', () => {
          mockEstablishmentsQualificationsResponse[0].NameValue = '80abc';
          const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);

          expect(typeof result[0].name).to.deep.equal('string');
        });

        it('should return a number if only number in string', () => {
          mockEstablishmentsQualificationsResponse[0].NameValue = '80';
          const result = convertQualificationsForEstablishments(mockEstablishmentsQualificationsResponse);

          expect(typeof result[0].name).to.deep.equal('number');
        });
      });
    });

    describe('Second establishment', async () => {
      it('should return array with second establishment name', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);

        expect(result[1].name).to.equal('Care Home');
      });

      it('should return worker details formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);
        const firstWorker = result[1].workerRecords[0];

        expect(firstWorker.workerId).to.equal('Test staff record');
        expect(firstWorker.jobRole).to.equal('Activities worker and care');
        expect(firstWorker.longTermAbsence).to.equal('');
        expect(firstWorker.mandatoryTraining).to.deep.equal(['Autism']);
      });

      it('should return first training record formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(mockEstablishmentsTrainingResponse);
        const firstWorkerFirstTrainingRecord = result[1].workerRecords[0].trainingRecords[0];

        expect(firstWorkerFirstTrainingRecord).to.deep.equal({
          category: 'Dementia care',
          categoryFK: 3,
          trainingName: 'Helen',
          expiryDate: new Date(today),
          status: 'Expiring soon',
          dateCompleted: new Date('2014-01-01T00:00:00.000Z'),
          accredited: 'No',

          isMandatory: 'No',
          validityPeriodInMonth: 60,
          trainingCertificateUploaded: 'Yes',
          deliveredBy: 'External provider',
          trainingProviderName: 'Care skill academy',
          howWasItDelivered: 'Face to face',
        });
      });
    });
  });

  describe('numberCheck', () => {
    it('should return string if string', () => {
      const result = numberCheck('Workplace Name');

      expect(result).to.equal('Workplace Name');
    });

    it('should return a string if number in string', () => {
      const result = numberCheck('80abc');

      expect(result).to.equal('80abc');
    });

    it('should return a string if number in string with letters', () => {
      const result = numberCheck('80abc');

      expect(typeof result).to.deep.equal('string');
    });

    it('should return a number if only number in string', () => {
      const result = numberCheck('80');

      expect(typeof result).to.deep.equal('number');
    });
  });

  describe('getTrainingRecordStatus', () => {
    it('should return "Expired" when a training record has expired', () => {
      const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
      const expiringSoonDate = new Date(new Date().setHours(0, 0, 0, 0));
      expiringSoonDate.setDate(currentDate.getDate() - 1);

      const result = getTrainingRecordStatus(expiringSoonDate, '90');
      expect(result).to.deep.equal('Expired');
    });

    it('should return "Expiring soon" when a training record is expiring within expiresSoonAlertDate', () => {
      const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
      const expiringSoonDate = new Date(new Date().setHours(0, 0, 0, 0));
      expiringSoonDate.setDate(currentDate.getDate() + 30);

      const result = getTrainingRecordStatus(expiringSoonDate, '60');
      expect(result).to.deep.equal('Expiring soon');
    });

    it('should return "Up-to-date" when a training record is not expiring within expiresSoonAlertDate', () => {
      const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
      const expiringSoonDate = new Date(new Date().setHours(0, 0, 0, 0));
      expiringSoonDate.setDate(currentDate.getDate() + 100);

      const result = getTrainingRecordStatus(expiringSoonDate, '60');
      expect(result).to.deep.equal('Up-to-date');
    });

    it('should return "Up-to-date" when expiry date has not been passed in', () => {
      const result = getTrainingRecordStatus('', '60');
      expect(result).to.deep.equal('Up-to-date');
    });
  });

  describe('listMissingMandatoryTrainings', () => {
    const mockData = mockEstablishmentsTrainingResponse[0].workers;

    it('should return an empty array if worker does not have mandatory training records missing', () => {
      const expected = [];
      const actual = listMissingMandatoryTrainings(mockData[1]);
      expect(actual).to.deep.equal(expected);
    });

    it('should return a list of mandatory training records that the worker is missing', () => {
      const expected = [
        {
          category: 'Communication skills',
          status: 'Missing',
          isMandatory: 'Yes',
        },
      ];
      const actual = listMissingMandatoryTrainings(mockData[0]);
      expect(actual).to.deep.equal(expected);
    });
  });

  describe('listAllExistingAndMissingTrainings', () => {
    it('should extract all training records and missing mandatory trainings from the workplaces, and return as one single array', () => {
      const trainingRecords = listAllExistingAndMissingTrainings(mockWorkerTrainingRecords);

      expect(trainingRecords.length).to.equal(7);

      expect(trainingRecords[0]).to.deep.include(mockWorkerTrainingRecords[0].workerRecords[0].trainingRecords[0]);
      expect(trainingRecords[1]).to.deep.include(mockWorkerTrainingRecords[0].workerRecords[0].trainingRecords[1]);

      expect(trainingRecords[2]).to.deep.include(mockWorkerTrainingRecords[0].workerRecords[1].trainingRecords[0]);
      expect(trainingRecords[3]).to.deep.include(mockWorkerTrainingRecords[0].workerRecords[1].trainingRecords[1]);
      expect(trainingRecords[4]).to.deep.include(
        mockWorkerTrainingRecords[0].workerRecords[1].missingMandatoryTrainings[0],
      );

      expect(trainingRecords[5]).to.deep.include(
        mockWorkerTrainingRecords[0].workerRecords[2].missingMandatoryTrainings[0],
      );
      expect(trainingRecords[6]).to.deep.include(
        mockWorkerTrainingRecords[0].workerRecords[2].missingMandatoryTrainings[1],
      );
    });

    it('should add workplace and worker data to the training', () => {
      const trainingRecords = listAllExistingAndMissingTrainings(mockWorkerTrainingRecords);
      const allworkerNames = mockWorkerTrainingRecords[0].workerRecords.map((worker) => worker.workerId);

      trainingRecords.forEach((record) => {
        expect(record.workplaceName).to.equal(mockWorkerTrainingRecords[0].name);
        expect(allworkerNames).to.include(record.workerNameOrId);
      });
    });
  });

  describe('buildTrainingCategorySummary', () => {
    it('should build a summary grouped by training category with totals', () => {
      const result = buildTrainingCategorySummary(mockWorkerTrainingRecords);

      expect(result).to.deep.include({
        trainingCategory: 'Activity provision/Well-being',
        mandatory: 'Yes',

        total: 3,
        expired: 0,
        expiringSoon: 0,
        upToDate: 1,
        missing: 2,
      });

      expect(result).to.deep.include({
        trainingCategory: 'Diabetes',
        mandatory: 'Yes',

        total: 2,
        expired: 1,
        expiringSoon: 0,
        upToDate: 0,
        missing: 1,
      });

      expect(result).to.deep.include({
        trainingCategory: 'Dementia care',
        mandatory: 'No',

        total: 1,
        expired: 0,
        expiringSoon: 1,
        upToDate: 0,
        missing: 0,
      });

      expect(result).to.deep.include({
        trainingCategory: 'Emergency Aid awareness',
        mandatory: 'No',

        total: 1,
        expired: 0,
        expiringSoon: 0,
        upToDate: 1,
        missing: 0,
      });

      expect(result[result.length - 1]).to.deep.equal({
        trainingCategory: 'Total',
        mandatory: '-',

        total: 7,
        expired: 1,
        expiringSoon: 1,
        upToDate: 2,
        missing: 3,
      });
    });
  });
});
