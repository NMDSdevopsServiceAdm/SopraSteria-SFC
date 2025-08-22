const expect = require('chai').expect;
const sinon = require('sinon');
const {
  clearDHAWorkerAnswersOnWorkplaceChange,
  clearDHAWorkplaceAnswerOnChange,
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

  describe('beforeSave: clearDHAWorkplaceAnswerOnChange', () => {
    let mockEstablishmentAuditModel = { create: () => {} };
    let mockEstablishmentDHActivitiesModel = { destroy: () => {} };

    const mockEstablishmentSequelizeInstance = {
      id: 'mock-establishment-id',
      changed: (fieldName) => fieldName === 'staffDoDelegatedHealthcareActivities',
      sequelize: {
        models: {
          establishmentAudit: mockEstablishmentAuditModel,
          EstablishmentDHActivities: mockEstablishmentDHActivitiesModel,
        },
      },
    };

    beforeEach(() => {
      sinon.spy(mockEstablishmentAuditModel, 'create');
      sinon.spy(mockEstablishmentDHActivitiesModel, 'destroy');
    });

    afterEach(() => {
      sinon.restore();
    });

    ['No', "Don't know", null].forEach((staffDoDHANewValue) => {
      it(`should clear the answer of staffWhatKindDHA when staffDoDHA change to ${staffDoDHANewValue}`, async () => {
        const mockEstablishment = {
          ...mockEstablishmentSequelizeInstance,
          staffDoDelegatedHealthcareActivities: staffDoDHANewValue,
          staffWhatKindDelegatedHealthcareActivities: {
            knowWhatActivities: 'Yes',
            activities: [{ id: 1 }],
          },
        };

        await clearDHAWorkplaceAnswerOnChange(mockEstablishment, mockOptions);

        expect(mockEstablishment.staffWhatKindDelegatedHealthcareActivities).to.deep.equal(null);
        expect(mockEstablishmentDHActivitiesModel.destroy).to.have.been.calledWith({
          where: { establishmentId: 'mock-establishment-id' },
          transaction: mockTransaction,
        });
      });
    });

    it('should create audit record for the change to staffWhatKindDHA', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        staffDoDelegatedHealthcareActivities: 'No',
        staffWhatKindDelegatedHealthcareActivities: {
          knowWhatActivities: 'Yes',
          activities: [{ id: 1 }],
        },
      };

      await clearDHAWorkplaceAnswerOnChange(mockEstablishment, mockOptions);

      expect(mockEstablishmentAuditModel.create).to.have.been.calledWith(
        {
          establishmentFk: 'mock-establishment-id',
          username: 'mock-username',
          type: 'changed',
          property: 'StaffWhatKindDelegatedHealthcareActivities',
          event: { new: null },
        },
        { transaction: mockTransaction },
      );
    });

    it('should not clear the answer of staffWhatKindDHA if staffDoDHA answer is "Yes"', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        staffDoDelegatedHealthcareActivities: 'Yes',
        staffWhatKindDelegatedHealthcareActivities: {
          knowWhatActivities: 'Yes',
          activities: [{ id: 1 }],
        },
      };

      await clearDHAWorkplaceAnswerOnChange(mockEstablishment, mockOptions);

      expect(mockEstablishment.staffWhatKindDelegatedHealthcareActivities).to.deep.equal({
        knowWhatActivities: 'Yes',
        activities: [{ id: 1 }],
      });
      expect(mockEstablishmentDHActivitiesModel.destroy).not.to.have.been.called;
      expect(mockEstablishmentAuditModel.create).not.to.have.been.called;
    });

    it('should do nothing if staffDoDelegatedHealthcareActivities is not changed', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        changed: () => false,
        staffDoDelegatedHealthcareActivities: 'No',
        staffWhatKindDelegatedHealthcareActivities: {
          knowWhatActivities: 'Yes',
          activities: [{ id: 1 }],
        },
      };

      await clearDHAWorkplaceAnswerOnChange(mockEstablishment, mockOptions);

      expect(mockEstablishment.staffWhatKindDelegatedHealthcareActivities).to.deep.equal({
        knowWhatActivities: 'Yes',
        activities: [{ id: 1 }],
      });
      expect(mockEstablishmentDHActivitiesModel.destroy).not.to.have.been.called;
      expect(mockEstablishmentAuditModel.create).not.to.have.been.called;
    });
  });
});
