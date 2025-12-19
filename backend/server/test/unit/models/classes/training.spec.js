'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const moment = require('moment');
//include Training class
const Training = require('../../../../models/classes/training').Training;
const models = require('../../../../models');

const establishmentId = 123;
const workerUid = '69e62cc3-03bf-4128-b456-cf0350cd032f';
const workerRecords = [
  {
    id: 9718,
    uid: '59b6b514-89e0-4248-a62a-bbe721aab8ef',
    localIdentifier: 'Fred',
    nameOrId: 'Fred',
    contract: 'Permanent',
    mainJob: {
      jobId: 29,
      title: 'Technician ',
    },
    completed: false,
    created: '2019-09-03T09:04:05.873Z',
    updated: '2019-10-24T05:47:09.703Z',
    updatedBy: 'uname70',
    effectiveFrom: '2019-04-01T00:00:00.000Z',
    wdfEligible: false,
  },
];

const workerTrainingRecords = {
  workerUid: '59b6b514-89e0-4248-a62a-bbe721aab8ef',
  count: 1,
  lastUpdated: '2019-11-07T03:41:55.870Z',
  training: [
    {
      uid: '4240c7ed-eb3a-4a94-8d08-11b4869d0d90',
      trainingCategory: {
        id: 14,
        category: 'Emergency Aid awareness',
      },
      title: 'Test 2',
      accredited: 'Yes',
      completed: '2019-09-12',
      expires: '2019-10-10',
      created: '2019-11-07T03:41:55.870Z',
      updated: '2019-11-07T03:41:55.870Z',
      updatedBy: 'uname70',
    },
  ],
};

describe('/server/models/class/training.js', () => {
  describe('getExpiringAndExpiredTrainingCounts', () => {
    afterEach(() => {
      sinon.restore();
    });

    beforeEach(() => {
      sinon.stub(Training, 'fetch').returns(workerTrainingRecords);
      sinon.stub(Training, 'getAllMissingMandatoryTrainingCounts').returns(null);
    });

    it('should return updated worker records : Training.getAllRequiredCounts', async () => {
      const updateTrainingRecords = await Training.getAllRequiredCounts(establishmentId, workerRecords);
      if (updateTrainingRecords) {
        expect(updateTrainingRecords[0]).to.have.property('trainingCount');
        expect(updateTrainingRecords[0]).to.have.property('expiredTrainingCount');
        expect(updateTrainingRecords[0]).to.have.property('expiringTrainingCount');
      }
    });

    it('should return updated worker records with expiring training : Training.getAllRequiredCounts', async () => {
      workerTrainingRecords.training[0].expires = moment().add(4, 'day').format('YYYY-MM-DD');
      workerRecords[0].expiringTrainingCount = 0;
      const updateTrainingRecords = await Training.getAllRequiredCounts(establishmentId, workerRecords);
      if (updateTrainingRecords) {
        expect(workerRecords[0].expiringTrainingCount).to.equal(1);
      }
    });

    it('should return updated worker records with blank training records : Training.getAllRequiredCounts', async () => {
      workerTrainingRecords.training = [];
      const updateTrainingRecords = await Training.getAllRequiredCounts(establishmentId, workerRecords);
      if (updateTrainingRecords) {
        expect(updateTrainingRecords[0].trainingCount).to.equal(0);
      }
    });
  });

  describe('fetch', () => {
    afterEach(() => {
      sinon.restore();
    });
    describe('DB call', () => {
      it('should make database call without where clause when no categoryId', async () => {
        const workerTrainingFindAll = sinon.stub(models.workerTraining, 'findAll').resolves([]);
        await Training.fetch(establishmentId, workerUid);

        expect(workerTrainingFindAll.args[0][0]).to.deep.equal({
          include: [
            {
              model: models.worker,
              as: 'worker',
              attributes: ['id', 'uid'],
              where: {
                uid: workerUid,
              },
            },
            {
              model: models.workerTrainingCategories,
              as: 'category',
              attributes: ['id', 'category'],
            },
            {
              model: models.trainingCertificates,
              as: 'trainingCertificates',
              attributes: ['uid', 'filename', 'uploadDate'],
            },
            {
              model: models.trainingProvider,
              as: 'trainingProvider',
              attributes: ['id', 'name', 'isOther'],
            },
          ],
          order: [['updated', 'DESC']],
        });
      });

      it('should make database call with where clause when categoryId provided', async () => {
        const categoryId = 12;
        const workerTrainingFindAll = sinon.stub(models.workerTraining, 'findAll').resolves([]);
        await Training.fetch(establishmentId, workerUid, categoryId);

        expect(workerTrainingFindAll.args[0][0]).to.deep.equal({
          include: [
            {
              model: models.worker,
              as: 'worker',
              attributes: ['id', 'uid'],
              where: {
                uid: workerUid,
              },
            },
            {
              model: models.workerTrainingCategories,
              as: 'category',
              attributes: ['id', 'category'],
            },
            {
              model: models.trainingCertificates,
              as: 'trainingCertificates',
              attributes: ['uid', 'filename', 'uploadDate'],
            },
            {
              model: models.trainingProvider,
              as: 'trainingProvider',
              attributes: ['id', 'name', 'isOther'],
            },
          ],
          order: [['updated', 'DESC']],
          where: {
            categoryFk: categoryId,
          },
        });
      });
    });

    it('should return formatted version of training record from database', async () => {
      const trainingRecordFromDatabase = mockTrainingRecordFromDatabase();

      const formattedTrainingRecord = {
        uid: 'abc123',
        trainingCategory: {
          id: 'def456',
          category: 'Test Category',
        },
        trainingCertificates: [
          {
            uid: 'ghi789',
            filename: 'certificate.pdf',
            uploadDate: '2024-01-03T00:00:00.000Z',
          },
        ],
        title: 'Title',
        accredited: undefined,
        completed: '2023-12-03',
        expires: '2024-12-03',
        notes: undefined,
        created: '2023-12-03T00:00:00.000Z',
        updated: '2023-12-04T00:00:00.000Z',
        updatedBy: 'user1',
      };

      sinon.stub(models.workerTraining, 'findAll').resolves([trainingRecordFromDatabase]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.training[0]).to.deep.equal(formattedTrainingRecord);
    });

    it('should return count as length of training records array when no records', async () => {
      sinon.stub(models.workerTraining, 'findAll').resolves([]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.count).to.equal(0);
    });

    it('should return count as length of training records array when 2 records', async () => {
      sinon
        .stub(models.workerTraining, 'findAll')
        .resolves([mockTrainingRecordFromDatabase(), mockTrainingRecordFromDatabase()]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.count).to.equal(2);
    });

    it('should return trainingCertificates as empty array and count as 0 when no certificate records returned from database (empty array)', async () => {
      const trainingRecordFromDatabase = mockTrainingRecordFromDatabase();
      trainingRecordFromDatabase.trainingCertificates = [];

      sinon.stub(models.workerTraining, 'findAll').resolves([trainingRecordFromDatabase]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.training[0].trainingCertificates).to.deep.equal([]);
    });

    it('should not return trainingCertificates when no certificate records returned from database (null)', async () => {
      const trainingRecordFromDatabase = mockTrainingRecordFromDatabase();
      trainingRecordFromDatabase.trainingCertificates = null;

      sinon.stub(models.workerTraining, 'findAll').resolves([trainingRecordFromDatabase]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.training[0].trainingCertificates).to.deep.equal(undefined);
    });

    it('should not return trainingCertificates when no certificate records returned from database (null)', async () => {
      const trainingRecordFromDatabase = mockTrainingRecordFromDatabase();
      trainingRecordFromDatabase.trainingCertificates = null;

      sinon.stub(models.workerTraining, 'findAll').resolves([trainingRecordFromDatabase]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.training[0].trainingCertificates).to.deep.equal(undefined);
    });

    it('should set lastUpdated as updated of record in ISO format when single training record', async () => {
      const trainingRecordFromDatabase = mockTrainingRecordFromDatabase();
      trainingRecordFromDatabase.updated = new Date('2024-04-02');

      sinon.stub(models.workerTraining, 'findAll').resolves([trainingRecordFromDatabase]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.lastUpdated).to.equal('2024-04-02T00:00:00.000Z');
    });

    it('should set lastUpdated as updated of record with latest updated in ISO format when several training records', async () => {
      const trainingRecord1 = mockTrainingRecordFromDatabase();
      trainingRecord1.updated = new Date('2024-04-02');

      const trainingRecord2 = mockTrainingRecordFromDatabase();
      trainingRecord2.updated = new Date('2024-06-02');

      const trainingRecord3 = mockTrainingRecordFromDatabase();
      trainingRecord3.updated = new Date('2024-02-02');

      sinon.stub(models.workerTraining, 'findAll').resolves([trainingRecord1, trainingRecord2, trainingRecord3]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.lastUpdated).to.equal('2024-06-02T00:00:00.000Z');
    });

    it('should set lastUpdated as undefined when no training records', async () => {
      sinon.stub(models.workerTraining, 'findAll').resolves([]);
      const res = await Training.fetch(establishmentId, workerUid);

      expect(res.lastUpdated).to.equal(undefined);
    });
  });
});

const mockTrainingRecordFromDatabase = () => {
  return {
    uid: 'abc123',
    category: {
      id: 'def456',
      category: 'Test Category',
    },
    trainingCertificates: [
      {
        uid: 'ghi789',
        filename: 'certificate.pdf',
        uploadDate: new Date('2024-01-03'),
      },
    ],
    title: 'Title',
    accredited: false,
    completed: new Date('2023-12-03'),
    expires: new Date('2024-12-03'),
    notes: null,
    created: new Date('2023-12-03'),
    updated: new Date('2023-12-04'),
    updatedBy: 'user1',
  };
};
