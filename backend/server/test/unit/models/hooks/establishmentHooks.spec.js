const expect = require('chai').expect;
const sinon = require('sinon');
const {
  clearDHAWorkerAnswersOnWorkplaceChange,
  clearDHAWorkplaceAnswerOnChange,
} = require('../../../../models/hooks/establishmentHooks');

describe('Establishment sequelize hooks', () => {
  const mockOptions = { transaction: {}, savedBy: 'username' };

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

  describe('beforeSave: clearDHAWorkplaceAnswerOnWorkplaceChange', () => {
    const mockEstablishmentSequelizeInstance = {
      id: 'mock-establishment-id',
      changed: () => false,
      sequelize: {},
    };

    it('should clear the answer of staffWhatKindDHA when staffDoDHA change to No', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        changed: (fieldName) => fieldName === 'staffDoDelegatedHealthcareActivities',
        staffDoDelegatedHealthcareActivities: 'No',
        staffWhatKindDelegatedHealthcareActivities: {
          knowWhatActivities: 'Yes',
          activities: [{ id: 1 }],
        },
      };

      await clearDHAWorkplaceAnswerOnChange(mockEstablishment, mockOptions);

      expect(mockEstablishment.staffWhatKindDelegatedHealthcareActivities).to.equal(null);
    });

    ['No', "Don't know", null].forEach((staffDoDHANewValue) => {
      it(`should clear the answer of staffWhatKindDHA when staffDoDHA change to ${staffDoDHANewValue}`, async () => {
        const mockEstablishment = {
          ...mockEstablishmentSequelizeInstance,
          changed: (fieldName) => fieldName === 'staffDoDelegatedHealthcareActivities',
          staffDoDelegatedHealthcareActivities: staffDoDHANewValue,
          staffWhatKindDelegatedHealthcareActivities: {
            knowWhatActivities: 'Yes',
            activities: [{ id: 1 }],
          },
        };

        await clearDHAWorkplaceAnswerOnChange(mockEstablishment, mockOptions);

        expect(mockEstablishment.staffWhatKindDelegatedHealthcareActivities).to.deep.equal(null);
      });
    });

    it('should not clear the answer of staffWhatKindDHA if staffDoDHA answer is "Yes"', async () => {
      const mockEstablishment = {
        ...mockEstablishmentSequelizeInstance,
        changed: (fieldName) => fieldName === 'staffDoDelegatedHealthcareActivities',
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
    });
  });
});
