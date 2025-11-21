const expect = require('chai').expect;
const sinon = require('sinon');
const lodash = require('lodash');
const { mockTrainingCourses } = require('../mockdata/trainingCourse');
const models = require('../../../models/index');
const { NotFoundError } = require('../../../utils/errors/customErrors');

describe.only('TrainingCourse model', () => {
  describe('updateTrainingCourse', () => {
    afterEach(() => {
      sinon.restore();
    });

    const mockSequelizeRecord = {
      ...mockTrainingCourses[0],
      toJSON() {
        return lodash.omit(this, ['update', 'toJSON']);
      },
      update() {
        return this;
      },
    };
    const establishmentId = 'mock-establishment-id';
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
    const mockUsername = 'username';
    const mockTransaction = {};

    it('should find the given training course record and apply update to it', async () => {
      const updateRecordSpy = sinon.stub(mockSequelizeRecord, 'update').callThrough();
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockSequelizeRecord);

      await models.trainingCourse.updateTrainingCourse({
        establishmentId,
        trainingCourseUid,
        updates: mockUpdates,
        updatedBy: mockUsername,
        transaction: mockTransaction,
      });

      expect(models.trainingCourse.findOne).to.have.been.calledWith(
        sinon.match({
          where: { establishmentFk: establishmentId, uid: trainingCourseUid, archived: false },
        }),
      );

      expect(updateRecordSpy).to.have.been.calledWith(
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
        establishmentId,
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
        establishmentId,
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
});
