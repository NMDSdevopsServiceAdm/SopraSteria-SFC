const expect = require('chai').expect;
const sinon = require('sinon');
const {
  clearDHAWorkerAnswersOnWorkplaceChange,
  clearDoDHAWorkplaceOnMainServiceChange,
} = require('../../../../models/hooks/establishmentHooks');

describe('Establishment sequelize hooks', () => {
  const mockTransaction = {};
  const mockOptions = { transaction: mockTransaction, savedBy: 'mock-username' };
  describe('beforeSave: clearDHAWorkerAnswersOnWorkplaceChange', () => {
    let mockWorkerModel = { clearDHAAnswerForAllWorkersInWorkplace: () => {} };

    beforeEach(() => {
      sinon.spy(mockWorkerModel, 'clearDHAAnswerForAllWorkersInWorkplace');
    });

    afterEach(() => {
      sinon.restore();
    });

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

  describe('clearDHAWorkplaceAnswersOnMainServiceChange', () => {
    let mockWorkerModel = { clearDHAAnswerForAllWorkersInWorkplace: () => {} };

    let mockServicesModel = {
      getCanDoDelegatedHealthcareActivities: () => {},
    };

    let mockEstablishmentAuditModel = { create: () => {} };

    let getCanDoDelegatedHealthcareActivitiesStub;

    beforeEach(() => {
      sinon.spy(mockWorkerModel, 'clearDHAAnswerForAllWorkersInWorkplace');
      getCanDoDelegatedHealthcareActivitiesStub = sinon.stub(
        mockServicesModel,
        'getCanDoDelegatedHealthcareActivities',
      );
      sinon.spy(mockEstablishmentAuditModel, 'create');
    });

    afterEach(() => {
      sinon.restore();
    });

    const mockEstablishmentSequelizeInstance = {
      id: '155',
      changed: () => false,
      MainServiceFKValue: 2,
      sequelize: {
        models: {
          services: mockServicesModel,
          worker: mockWorkerModel,
          establishmentAudit: mockEstablishmentAuditModel,
        },
      },
    };

    it('should not clear anything if MainServiceFK was changed to a value that can also do DHA', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        changed: (fieldName) => fieldName === 'MainServiceFKValue',
        MainServiceFKValue: 3,
        staffDoDelegatedHealthcareActivities: 'Yes',
      };

      getCanDoDelegatedHealthcareActivitiesStub.resolves({ canDoDelegatedHealthcareActivities: true });

      await clearDoDHAWorkplaceOnMainServiceChange(mockEstablishment, mockOptions);

      expect(mockWorkerModel.clearDHAAnswerForAllWorkersInWorkplace).not.to.have.been.called;
      expect(mockServicesModel.getCanDoDelegatedHealthcareActivities).to.have.been.calledWith(
        mockEstablishment.MainServiceFKValue,
      );
      expect(mockEstablishmentAuditModel.create).not.to.have.been.called;
      expect(mockEstablishment.staffDoDelegatedHealthcareActivities).to.equal('Yes');
    });

    it('should not clear anything if MainServiceFK did not change', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        changed: () => false,
        staffDoDelegatedHealthcareActivities: 'Yes',
      };

      await clearDoDHAWorkplaceOnMainServiceChange(mockEstablishment, mockOptions);

      expect(mockServicesModel.getCanDoDelegatedHealthcareActivities).not.to.have.been.called;
      expect(mockWorkerModel.clearDHAAnswerForAllWorkersInWorkplace).not.to.have.been.called;
      expect(mockEstablishmentAuditModel.create).not.to.have.been.called;
      expect(mockEstablishment.staffDoDelegatedHealthcareActivities).to.equal('Yes');
    });

    describe('main service is changed to one that can not do DHA', () => {
      it('should not clear anything if staffDoDelegatedHealthcareActivities is null', async () => {
        const mockEstablishment = {
          ...mockEstablishmentSequelizeInstance,
          changed: (fieldName) => fieldName === 'MainServiceFKValue',
          MainServiceFKValue: 1,
          staffDoDelegatedHealthcareActivities: null,
        };

        await clearDoDHAWorkplaceOnMainServiceChange(mockEstablishment, mockOptions);

        expect(mockServicesModel.getCanDoDelegatedHealthcareActivities).not.to.have.been.called;
        expect(mockWorkerModel.clearDHAAnswerForAllWorkersInWorkplace).not.to.have.been.called;
        expect(mockEstablishmentAuditModel.create).not.to.have.been.called;
        expect(mockEstablishment.staffDoDelegatedHealthcareActivities).to.equal(null);
      });

      ['Yes', 'No', "Don't know"].forEach((answer) => {
        it(`should clear staffDoDelegatedHealthcareActivities if staffDoDelegatedHealthcareActivities is ${answer}`, async () => {
          const mockEstablishment = {
            ...mockEstablishmentSequelizeInstance,
            changed: (fieldName) => fieldName === 'MainServiceFKValue',
            MainServiceFKValue: 1,
            staffDoDelegatedHealthcareActivities: answer,
          };

          getCanDoDelegatedHealthcareActivitiesStub.resolves({ canDoDelegatedHealthcareActivities: false });

          await clearDoDHAWorkplaceOnMainServiceChange(mockEstablishment, mockOptions);

          expect(mockWorkerModel.clearDHAAnswerForAllWorkersInWorkplace).to.have.been.calledWith(
            mockEstablishment.id,
            mockOptions,
          );
          expect(mockServicesModel.getCanDoDelegatedHealthcareActivities).to.have.been.calledWith(
            mockEstablishment.MainServiceFKValue,
          );
          expect(mockEstablishmentAuditModel.create).to.have.been.calledWith(
            {
              establishmentFk: mockEstablishment.id,
              username: mockOptions.savedBy,
              type: 'changed',
              property: 'StaffDoDelegatedHealthcareActivities',
              event: { new: null },
            },
            { transaction: mockTransaction },
          );
          expect(mockEstablishment.staffDoDelegatedHealthcareActivities).to.equal(null);
        });
      });
    });
  });
});
