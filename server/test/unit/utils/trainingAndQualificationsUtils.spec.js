const expect = require('chai').expect;
const {
  getTrainingTotals,
  convertQualificationsForEstablishments,
  convertWorkersWithCareCertificateStatus,
  convertTrainingForEstablishments,
} = require('../../../utils/trainingAndQualificationsUtils');
const {
  mockWorkerTrainingBreakdowns,
  mockEstablishmentsQualificationsResponse,
  mockEstablishmentsCareCertificateResponse,
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

  const establishments =
  [
    {
      id: 2320,
      NameValue: 'Nursing Home',
      workers: [
        {
          id: 11169,
          mainJob: { id: 1, title: 'Activities worker or co-ordinator' },
          get(property) {
            if (property === 'NameOrIdValue') return 'New staff record';
            if (property === 'mandatoryTrainingCategories') return [ 'Communication skills' ];
            if (property === 'LongTermAbsence') return null;
          },
          workerTraining: [
            {
              get(property) {
                if (property === 'category') return { category: 'Dementia care' };
                if (property === 'Expires') return '2021-10-08';
                if (property === 'Completed') return '2020-01-01';
                if (property === 'CategoryFK') return 10;
                if (property === 'Title') return 'Great';
                if (property === 'Accredited') return 'No';
              },
            },
            {
              get(property) {
                if (property === 'category') return { category: 'Old age care' };
                if (property === 'Expires') return '2022-10-08';
                if (property === 'Completed') return '2020-01-01';
                if (property === 'CategoryFK') return 5;
                if (property === 'Title') return 'Old age care training';
                if (property === 'Accredited') return 'Yes';
              },
            },
          ],
        },
        {
          id: 1131,
          mainJob: { id: 3, title: 'Care giver' },
          get(property) {
            if (property === 'NameOrIdValue') return 'Another staff record';
            if (property === 'mandatoryTrainingCategories') return [ 'Learning' ];
            if (property === 'LongTermAbsence') return 'Yes';
          },
          workerTraining: [
            {
              get(property) {
                if (property === 'category') return { category: 'Learning' };
                if (property === 'Expires') return '2023-10-08';
                if (property === 'Completed') return '2020-01-01';
                if (property === 'CategoryFK') return 10;
                if (property === 'Title') return 'Test Training';
                if (property === 'Accredited') return 'No';
              },
            },
          ],
        },
      ],
    },
    {
      id: 2320,
      NameValue: 'Care Home',
      workers: [
        {
          id: 11169,
          mainJob: { id: 1, title: 'Activities worker and care' },
          get(property) {
            if (property === 'NameOrIdValue') return 'Test staff record';
            if (property === 'mandatoryTrainingCategories') return [ 'Autism' ];
            if (property === 'LongTermAbsence') return null;
          },
          workerTraining: [
            {
              get(property) {
                if (property === 'category') return { category: 'Dementia care' };
                if (property === 'Expires') return '2019-10-05';
                if (property === 'Completed') return '2014-01-01';
                if (property === 'CategoryFK') return 3;
                if (property === 'Title') return 'Helen';
                if (property === 'Accredited') return 'No';
              },
            },
          ],
        },
      ],
    },
  ];

  describe('convertTrainingForEstablishments', () => {
    describe('First establishment', async () => {
      it('should return array with first establishment name', () => {
        const result = convertTrainingForEstablishments(establishments);

        expect(result[0].name).to.equal('Nursing Home');
      });

      it('should return worker details formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(establishments);
        const firstWorker = result[0].workerRecords[0];

        expect(firstWorker.workerId).to.equal('New staff record');
        expect(firstWorker.jobRole).to.equal('Activities worker or co-ordinator');
        expect(firstWorker.longTermAbsence).to.equal('');
        expect(firstWorker.mandatoryTraining).to.deep.equal([ 'Communication skills' ]);
      });

      it('should return first training record formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(establishments);
        const firstWorkerFirstTrainingRecord = result[0].workerRecords[0].trainingRecords[0];

        expect(firstWorkerFirstTrainingRecord).to.deep.equal({
          category: 'Dementia care',
          categoryFK: 10,
          trainingName: 'Great',
          expiryDate: new Date('2021-10-08T00:00:00.000Z'),
          status: 'Expired',
          dateCompleted: new Date('2020-01-01T00:00:00.000Z'),
          accredited: 'No'
        });
      });

      it('should return second training record formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(establishments);
        const firstWorkerFirstTrainingRecord = result[0].workerRecords[0].trainingRecords[1];

        expect(firstWorkerFirstTrainingRecord).to.deep.equal({
          category: 'Old age care',
          categoryFK: 5,
          trainingName: 'Old age care training',
          expiryDate: new Date('2022-10-08T00:00:00.000Z'),
          status: 'Up-to-date',
          dateCompleted: new Date('2020-01-01T00:00:00.000Z'),
          accredited: 'Yes'
        });
      });

      it('should return worker details formatted as expected for second worker', () => {
        const result = convertTrainingForEstablishments(establishments);
        const firstWorker = result[0].workerRecords[1];

        expect(firstWorker.workerId).to.equal('Another staff record');
        expect(firstWorker.jobRole).to.equal('Care giver');
        expect(firstWorker.longTermAbsence).to.equal('Yes');
        expect(firstWorker.mandatoryTraining).to.deep.equal([ 'Learning' ]);
      });

      it('should return first training record formatted as expected for second worker', () => {
        const result = convertTrainingForEstablishments(establishments);
        const firstWorkerFirstTrainingRecord = result[0].workerRecords[1].trainingRecords[0];

        expect(firstWorkerFirstTrainingRecord).to.deep.equal({
          category: 'Learning',
          categoryFK: 10,
          trainingName: 'Test Training',
          expiryDate: new Date('2023-10-08T00:00:00.000Z'),
          status: 'Up-to-date',
          dateCompleted: new Date('2020-01-01T00:00:00.000Z'),
          accredited: 'No'
        });
      });
    });

    describe('Second establishment', async () => {
      it('should return array with second establishment name', () => {
        const result = convertTrainingForEstablishments(establishments);

        expect(result[1].name).to.equal('Care Home');
      });

      it('should return worker details formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(establishments);
        const firstWorker = result[1].workerRecords[0];

        expect(firstWorker.workerId).to.equal('Test staff record');
        expect(firstWorker.jobRole).to.equal('Activities worker and care');
        expect(firstWorker.longTermAbsence).to.equal('');
        expect(firstWorker.mandatoryTraining).to.deep.equal([ 'Autism' ]);
      });

      it('should return first training record formatted as expected for first worker', () => {
        const result = convertTrainingForEstablishments(establishments);
        const firstWorkerFirstTrainingRecord = result[1].workerRecords[0].trainingRecords[0];

        expect(firstWorkerFirstTrainingRecord).to.deep.equal({
          category: 'Dementia care',
          categoryFK: 3,
          trainingName: 'Helen',
          expiryDate: new Date('2019-10-05T00:00:00.000Z'),
          status: 'Expired',
          dateCompleted: new Date('2014-01-01T00:00:00.000Z'),
          accredited: 'No'
        });
      });
    });
  });
});
