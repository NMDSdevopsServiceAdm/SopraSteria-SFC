const expect = require('chai').expect;
const sinon = require('sinon');
const { clearDHAWorkerAnswersOnWorkplaceChange } = require('../../../../models/hooks/establishmentHooks');

describe.only('Establishment sequelize hooks', () => {
  describe('beforeSave: clearDHAWorkerAnswersOnWorkplaceChange', () => {
    let mockWorkerModel = { clearDHAAnswerForAllWorkersInWorkplace: () => {} };

    beforeEach(() => {
      sinon.spy(mockWorkerModel, 'clearDHAAnswerForAllWorkersInWorkplace');
    });

    afterEach(() => {
      sinon.restore();
    });

    const mockOptions = { transaction: {}, savedBy: 'username' };

    const mockEstablishmentSequelizeInstance = {
      id: 'mock-establishment-id',
      changed: () => false,
      staffDoDelegatedHealthcareActivities: 'Yes',
      sequelize: { models: { worker: mockWorkerModel } },
    };

    it('should call worker.clearDHAAnswerForAllWorkersInWorkplace() if establishment staffDoDelegatedHealthcareActivities answer change to "No"', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        changed: (fieldName) => fieldName === 'staffDoDelegatedHealthcareActivities',
        staffDoDelegatedHealthcareActivities: 'No',
      };

      await clearDHAWorkerAnswersOnWorkplaceChange(mockEstablishment, mockOptions);

      expect(mockWorkerModel.clearDHAAnswerForAllWorkersInWorkplace).to.have.been.calledWith(
        mockEstablishment.id,
        mockOptions,
      );
    });

    ['Yes', "Don't know", null].forEach((value) => {
      it(`should not clear the worker answers if staffDoDelegatedHealthcareActivities new value is ${value}`, async () => {
        const mockEstablishment = {
          ...mockEstablishmentSequelizeInstance,
          changed: (fieldName) => fieldName === 'staffDoDelegatedHealthcareActivities',
          staffDoDelegatedHealthcareActivities: value,
        };

        await clearDHAWorkerAnswersOnWorkplaceChange(mockEstablishment, mockOptions);

        expect(mockWorkerModel.clearDHAAnswerForAllWorkersInWorkplace).not.to.have.been.called;
      });
    });

    it('should not clear the worker answers if staffDoDelegatedHealthcareActivities did not change', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        changed: () => false,
      };

      await clearDHAWorkerAnswersOnWorkplaceChange(mockEstablishment, mockOptions);

      expect(mockWorkerModel.clearDHAAnswerForAllWorkersInWorkplace).not.to.have.been.called;
    });
  });
});
