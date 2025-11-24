const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../models/index');
const { NotFoundError } = require('../../../utils/errors/customErrors');

describe.only('workerTraining model', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockTrainingRecordId = 'mockTrainingRecordId';
  const mockTransaction = {};
  const mockSequelizeRecord = {
    id: mockTrainingRecordId,
    completed: '2025-01-01',
    validityPeriodInMonth: 12,
    update() {
      return this;
    },
  };

  describe('autoFillInExpiryDate', () => {
    it('should update the expiry date of a training record, calculated from the completion date and validityPeriodInMonth', async () => {
      sinon.stub(models.workerTraining, 'findOne').resolves(mockSequelizeRecord);
      const updateRecordSpy = sinon.stub(mockSequelizeRecord, 'update').callThrough();

      await models.workerTraining.autoFillInExpiryDate({
        trainingRecordId: mockTrainingRecordId,
        transaction: mockTransaction,
        updatedBy: 'mock-username',
      });
      expect(updateRecordSpy).to.have.been.calledWith(
        sinon.match({ expires: '2025-12-31', updatedBy: 'mock-username' }),
        {
          transaction: mockTransaction,
        },
      );
    });

    it('should not update the record if expiry date is not empty', async () => {
      sinon.stub(models.workerTraining, 'findOne').resolves({ ...mockSequelizeRecord, expires: '2026-06-01' });
      const updateRecordSpy = sinon.stub(mockSequelizeRecord, 'update').callThrough();

      await models.workerTraining.autoFillInExpiryDate({
        trainingRecordId: mockTrainingRecordId,
        transaction: mockTransaction,
        updatedBy: 'mock-username',
      });
      expect(updateRecordSpy).not.to.have.been.called;
    });

    it('should not update the record if completion date is missing', async () => {
      sinon.stub(models.workerTraining, 'findOne').resolves({ ...mockSequelizeRecord, completed: undefined });
      const updateRecordSpy = sinon.stub(mockSequelizeRecord, 'update').callThrough();

      await models.workerTraining.autoFillInExpiryDate({
        trainingRecordId: mockTrainingRecordId,
        transaction: mockTransaction,
        updatedBy: 'mock-username',
      });
      expect(updateRecordSpy).not.to.have.been.called;
    });

    it('should not update the record if validityPeriodInMonth is missing', async () => {
      sinon
        .stub(models.workerTraining, 'findOne')
        .resolves({ ...mockSequelizeRecord, validityPeriodInMonth: undefined });
      const updateRecordSpy = sinon.stub(mockSequelizeRecord, 'update').callThrough();

      await models.workerTraining.autoFillInExpiryDate({
        trainingRecordId: mockTrainingRecordId,
        transaction: mockTransaction,
        updatedBy: 'mock-username',
      });
      expect(updateRecordSpy).not.to.have.been.called;
    });

    it('should reject with NotFoundError if could not find a training record with the given ID', async () => {
      sinon.stub(models.workerTraining, 'findOne').resolves(null);
      const updateRecordSpy = sinon.stub(mockSequelizeRecord, 'update').callThrough();

      let error;
      try {
        await models.workerTraining.autoFillInExpiryDate({
          trainingRecordId: mockTrainingRecordId,
          transaction: mockTransaction,
          updatedBy: 'mock-username',
        });
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceof(NotFoundError);

      expect(updateRecordSpy).not.to.have.been.called;
    });
  });
});
