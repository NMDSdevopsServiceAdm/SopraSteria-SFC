const expect = require('chai').expect;
const sinon = require('sinon');
const lodash = require('lodash');
const { mockTrainingCourses } = require('../mockdata/trainingCourse');
const models = require('../../../models/index');
const { NotFoundError } = require('../../../utils/errors/customErrors');

describe.only('TrainingCourse model', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockEstablishmentId = 'mock-establishment-id';
  const mockUsername = 'mock-username';

  describe('updateTrainingCourse', () => {
    const mockSequelizeRecord = {
      ...mockTrainingCourses[0],
      toJSON() {
        return lodash.omit(this, ['update', 'toJSON']);
      },
      update() {
        return this;
      },
    };
    const trainingCourseUid = mockTrainingCourses[0].uid;
    const mockUpdates = {
      categoryFk: 10,
      trainingProviderFk: null,
      name: 'Care skills and knowledge',
      accredited: 'Yes',
      deliveredBy: 'In-house staff',
      otherTrainingProviderName: null,
      howWasItDelivered: 'E-learning',
      doesNotExpire: true,
      validityPeriodInMonth: null,
    };
    const mockTransaction = {};

    it('should find the given training course record and apply update to it', async () => {
      const updateSpy = sinon.stub(mockSequelizeRecord, 'update').callThrough();
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockSequelizeRecord);

      await models.trainingCourse.updateTrainingCourse({
        establishmentId: mockEstablishmentId,
        trainingCourseUid,
        updates: mockUpdates,
        updatedBy: mockUsername,
        transaction: mockTransaction,
      });

      expect(models.trainingCourse.findOne).to.have.been.calledWith(
        sinon.match({
          where: { establishmentFk: mockEstablishmentId, uid: trainingCourseUid, archived: false },
        }),
      );

      expect(updateSpy).to.have.been.calledWith(
        {
          ...mockUpdates,
          updatedBy: mockUsername,
        },
        { transaction: mockTransaction },
      );
    });

    it('should return the updated trainingCourse sequelize object', async () => {
      sinon.stub(mockSequelizeRecord, 'update').callThrough();
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockSequelizeRecord);

      const returnValue = await models.trainingCourse.updateTrainingCourse({
        establishmentId: mockEstablishmentId,
        trainingCourseUid,
        updates: mockUpdates,
        updatedBy: mockUsername,
        transaction: mockTransaction,
      });

      expect(returnValue).to.equal(mockSequelizeRecord);
    });

    it('should reject with a NotFoundError if the training course could not be found', async () => {
      const updateRecordSpy = sinon.stub(mockSequelizeRecord, 'update').callThrough();
      sinon.stub(models.trainingCourse, 'findOne').resolves(null);

      const params = {
        establishmentId: mockEstablishmentId,
        trainingCourseUid,
        updates: mockUpdates,
        updatedBy: mockUsername,
        transaction: mockTransaction,
      };

      let error;
      try {
        await models.trainingCourse.updateTrainingCourse(params);
      } catch (err) {
        error = err;
      }

      expect(error).to.be.instanceof(NotFoundError);
      expect(updateRecordSpy).not.to.have.been.called;
    });
  });

  describe('updateTrainingRecordsWithTrainingCourse', () => {
    const mockTrainingCourse = {
      ...mockTrainingCourses[0],
      toJSON() {
        return lodash.omit(this, ['update', 'toJSON']);
      },
    };
    const mockTrainingRecords = [
      { uid: 'mock-uid-1', id: 'mock-id-1' },
      { uid: 'mock-uid-2', id: 'mock-id-2' },
      { uid: 'mock-uid-3', id: 'mock-id-3' },
    ];
    const mockTrainingRecordUids = mockTrainingRecords.map((record) => record.uid);
    const mockEstablishmentId = 'mock-workplace-id';
    const mockTransaction = {};

    const expectedUpdates = {
      categoryFk: mockTrainingCourse.categoryFk,
      accredited: mockTrainingCourse.accredited,
      deliveredBy: mockTrainingCourse.deliveredBy,
      trainingProviderFk: mockTrainingCourse.trainingProviderFk,
      otherTrainingProviderName: mockTrainingCourse.otherTrainingProviderName,
      howWasItDelivered: mockTrainingCourse.howWasItDelivered,
      doesNotExpire: mockTrainingCourse.doesNotExpire,
      validityPeriodInMonth: mockTrainingCourse.validityPeriodInMonth,
      title: mockTrainingCourse.name,
      trainingCourseFK: mockTrainingCourse.id,
      updatedBy: mockUsername,
      updatedAt: sinon.match.any,
    };

    it('should update multiple training records with the data from trainingCourse', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockTrainingCourse);
      sinon.stub(models.workerTraining, 'findAll').resolves(mockTrainingRecords);

      const updateRecordSpy = sinon.stub(models.workerTraining, 'update');

      const returnValue = await models.trainingCourse.updateTrainingRecordsWithTrainingCourse({
        establishmentId: mockEstablishmentId,
        trainingRecordUids: mockTrainingRecordUids,
        trainingCourseUid: mockTrainingCourse.uid,
        transaction: mockTransaction,
        updatedBy: mockUsername,
      });

      expect(updateRecordSpy).to.have.been.calledWith(expectedUpdates, {
        where: { id: ['mock-id-1', 'mock-id-2', 'mock-id-3'] },
        transaction: mockTransaction,
      });

      expect(returnValue).to.deep.equal({ trainingRecordIds: ['mock-id-1', 'mock-id-2', 'mock-id-3'] });
    });

    it('should reject with NotFoundError if could not find the given training course', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(null);
      sinon.stub(models.workerTraining, 'findAll').resolves(mockTrainingRecords);

      const updateRecordSpy = sinon.stub(models.workerTraining, 'update');

      let error;
      try {
        await models.trainingCourse.updateTrainingRecordsWithTrainingCourse({
          establishmentId: mockEstablishmentId,
          trainingRecordUids: mockTrainingRecordUids,
          trainingCourseUid: mockTrainingCourse.uid,
          transaction: mockTransaction,
          updatedBy: mockUsername,
        });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.instanceOf(NotFoundError);
      expect(updateRecordSpy).not.to.have.been.called;
    });

    it('should reject with NotFoundError if could not find the training records', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockTrainingCourse);
      sinon.stub(models.workerTraining, 'findAll').resolves([]);

      const updateRecordSpy = sinon.stub(models.workerTraining, 'update');

      let error;
      try {
        await models.trainingCourse.updateTrainingRecordsWithTrainingCourse({
          establishmentId: mockEstablishmentId,
          trainingRecordUids: mockTrainingRecordUids,
          trainingCourseUid: mockTrainingCourse.uid,
          transaction: mockTransaction,
          updatedBy: mockUsername,
        });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.instanceOf(NotFoundError);
      expect(updateRecordSpy).not.to.have.been.called;
    });
  });
});
