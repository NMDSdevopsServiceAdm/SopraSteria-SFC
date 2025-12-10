const expect = require('chai').expect;
const sinon = require('sinon');
const lodash = require('lodash');
const { mockTrainingCourses } = require('../mockdata/trainingCourse');
const models = require('../../../models/index');
const { NotFoundError } = require('../../../utils/errors/customErrors');

describe('TrainingCourse model', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockEstablishmentId = 'mock-establishment-id';
  const mockUsername = 'mock-username';

  describe('updateTrainingCourse', () => {
    const mockSequelizeTrainingCourse = {
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
      const updateSpy = sinon.stub(mockSequelizeTrainingCourse, 'update').callThrough();
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockSequelizeTrainingCourse);

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
      sinon.stub(mockSequelizeTrainingCourse, 'update').callThrough();
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockSequelizeTrainingCourse);

      const returnValue = await models.trainingCourse.updateTrainingCourse({
        establishmentId: mockEstablishmentId,
        trainingCourseUid,
        updates: mockUpdates,
        updatedBy: mockUsername,
        transaction: mockTransaction,
      });

      expect(returnValue).to.equal(mockSequelizeTrainingCourse);
    });

    it('should reject with a NotFoundError if the training course could not be found', async () => {
      const updateRecordSpy = sinon.stub(mockSequelizeTrainingCourse, 'update').callThrough();
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

  describe('updateTrainingRecordsWithCourseData', () => {
    const mockTrainingRecords = [
      { id: 'record-id-1', uid: 'record-uid-1' },
      { id: 'record-id-2', uid: 'record-uid-2' },
      { id: 'record-id-3', uid: 'record-uid-3' },
    ];
    const mockTrainingRecordIds = mockTrainingRecords.map((record) => record.id);
    const mockTrainingRecordUids = mockTrainingRecords.map((record) => record.uid);

    const mockEstablishmentId = 'mock-workplace-id';

    const mockTrainingCourse = {
      ...mockTrainingCourses[0],
      establishmentFk: mockEstablishmentId,
      toJSON() {
        return lodash.omit(this, ['update', 'toJSON']);
      },
    };
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
      updated: sinon.match.date,
    };

    it('should update multiple training records with the data from trainingCourse', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockTrainingCourse);
      sinon.stub(models.workerTraining, 'autoFillInExpiryDate').resolves();
      sinon.stub(models.workerTraining, 'findAll').resolves(mockTrainingRecords);

      const updateRecordSpy = sinon.stub(models.workerTraining, 'update').resolves();

      await models.trainingCourse.updateTrainingRecordsWithCourseData({
        trainingCourseUid: mockTrainingCourse.uid,
        trainingRecordUids: mockTrainingRecordUids,
        transaction: mockTransaction,
        updatedBy: mockUsername,
      });

      expect(updateRecordSpy).to.have.been.calledWith(expectedUpdates, {
        where: { trainingCourseFK: mockTrainingCourse.id, id: mockTrainingRecordIds },
        transaction: mockTransaction,
      });
    });

    it('should only update training records that has uid in the given trainingRecordUids array', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockTrainingCourse);
      sinon.stub(models.workerTraining, 'autoFillInExpiryDate').resolves();
      const workerTrainingFindAllSpy = sinon.stub(models.workerTraining, 'findAll').resolves(mockTrainingRecords);
      sinon.stub(models.workerTraining, 'update').resolves();

      await models.trainingCourse.updateTrainingRecordsWithCourseData({
        trainingCourseUid: mockTrainingCourse.uid,
        trainingRecordUids: [mockTrainingRecords[0].uid, mockTrainingRecords[2].uid], // only update [0] and [2]
        transaction: mockTransaction,
        updatedBy: mockUsername,
      });

      expect(workerTrainingFindAllSpy).to.have.been.calledWith(
        sinon.match({
          where: {
            uid: [mockTrainingRecords[0].uid, mockTrainingRecords[2].uid],
            trainingCourseFK: 1,
          },
        }),
      );
    });

    it('should only update training records that are under the same workplace, and worker are not archived', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockTrainingCourse);
      sinon.stub(models.workerTraining, 'autoFillInExpiryDate').resolves();
      const workerTrainingFindAllSpy = sinon.stub(models.workerTraining, 'findAll').resolves(mockTrainingRecords);
      sinon.stub(models.workerTraining, 'update').resolves();

      await models.trainingCourse.updateTrainingRecordsWithCourseData({
        trainingCourseUid: mockTrainingCourse.uid,
        trainingRecordUids: mockTrainingRecordUids,
        transaction: mockTransaction,
        updatedBy: mockUsername,
      });

      expect(workerTrainingFindAllSpy).to.have.been.calledWith({
        where: {
          uid: mockTrainingRecordUids,
          trainingCourseFK: 1,
        },
        include: [
          {
            model: models.worker,
            as: 'worker',
            attributes: ['establishmentFk', 'archived'],
            where: { establishmentFk: mockTrainingCourse.establishmentFk, archived: false },
          },
        ],
        transaction: mockTransaction,
      });
    });

    it('should trigger autoFillInExpiryDate() for the affected training records', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockTrainingCourse);
      const autoFillInExpiryDateSpy = sinon.stub(models.workerTraining, 'autoFillInExpiryDate').resolves();

      sinon.stub(models.workerTraining, 'findAll').resolves(mockTrainingRecords);
      sinon.stub(models.workerTraining, 'update').resolves();

      await models.trainingCourse.updateTrainingRecordsWithCourseData({
        trainingCourseUid: mockTrainingCourse.uid,
        transaction: mockTransaction,
        updatedBy: mockUsername,
      });

      expect(autoFillInExpiryDateSpy).to.have.callCount(mockTrainingRecords.length);
      mockTrainingRecords.forEach((record) => {
        expect(autoFillInExpiryDateSpy).to.have.calledWith({
          trainingRecordId: record.id,
          transaction: mockTransaction,
          updatedBy: mockUsername,
        });
      });
    });

    it('should reject with NotFoundError if could not find the given training course', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(null);
      sinon.stub(models.workerTraining, 'autoFillInExpiryDate').resolves();

      const updateRecordSpy = sinon.stub(models.workerTraining, 'update');

      let error;
      try {
        await models.trainingCourse.updateTrainingRecordsWithCourseData({
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
