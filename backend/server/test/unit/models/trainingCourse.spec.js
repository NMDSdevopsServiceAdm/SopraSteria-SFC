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

  describe('updateTrainingRecordsWithCourseData', () => {
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

      const updateRecordSpy = sinon.stub(models.workerTraining, 'update');

      await models.trainingCourse.updateTrainingRecordsWithCourseData({
        trainingCourseUid: mockTrainingCourse.uid,
        transaction: mockTransaction,
        updatedBy: mockUsername,
      });

      expect(updateRecordSpy).to.have.been.calledWith(expectedUpdates, {
        where: { trainingCourseFK: mockTrainingCourse.id },
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

    it('should reject with NotFoundError if could not find the given training course', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(null);

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
