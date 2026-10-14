const expect = require('chai').expect;
const sinon = require('sinon');

const {
  unsetDHAAnswerOnJobRoleChange,
  unsetCWPRoleCategoryOnJobRoleChange,
} = require('../../../../models/hooks/workerHooks');

describe('Worker sequelize hooks', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('beforeSave: unsetDHAAnswerOnJobRoleChange', () => {
    const mockWorkerSequelizeInstance = {
      changed: (fieldName) => {
        return ['MainJobFkValue', 'updated'].includes(fieldName);
      },
      carryOutDelegatedHealthcareActivities: 'Yes',
      getMainJob() {
        return Promise.resolve({ id: 36, title: 'IT manager', canDoDelegatedHealthcareActivities: null });
      },
    };

    it('should set carryOutDelegatedHealthcareActivities to null if new job role cannot do DHA', async () => {
      const mockWorker = { ...mockWorkerSequelizeInstance };
      await unsetDHAAnswerOnJobRoleChange(mockWorker);

      expect(mockWorker.carryOutDelegatedHealthcareActivities).to.equal(null);
    });

    it('should keep carryOutDelegatedHealthcareActivities unchanged if new job role can do DHA', async () => {
      const mockWorker = {
        ...mockWorkerSequelizeInstance,
        getMainJob() {
          return Promise.resolve({ id: 10, title: 'Care worker', canDoDelegatedHealthcareActivities: true });
        },
      };

      await unsetDHAAnswerOnJobRoleChange(mockWorker);

      expect(mockWorker.carryOutDelegatedHealthcareActivities).to.deep.equal('Yes');
    });

    it('should do nothing if not changing the main job', async () => {
      const mockWorker = {
        ...mockWorkerSequelizeInstance,
        changed: () => {
          return false;
        },
        getMainJob: sinon.stub(),
      };

      await unsetDHAAnswerOnJobRoleChange(mockWorker);

      expect(mockWorker.getMainJob).not.to.have.been.called;
      expect(mockWorker.carryOutDelegatedHealthcareActivities).to.deep.equal('Yes');
    });
  });

  describe('beforeSave: unsetCWPRoleCategoryOnJobRoleChange', () => {
    const mockWorkerSequelizeInstance = {
      changed: (fieldName) => {
        return ['MainJobFkValue', 'updated'].includes(fieldName);
      },
      CareWorkforcePathwayRoleCategoryFK: 7,
      CWPRoleCategoryIsAlsoNominatedIndividual: true,
      getMainJob() {
        return Promise.resolve({ id: 23, title: 'Registered nurse', excludedFromCareWorkforcePathway: true });
      },
    };

    it('should set CareWorkforcePathwayRoleCategoryFK to null and CWPRoleCategoryIsAlsoNominatedIndividual to false if new job role is exclude from CareWorkforcePathway', async () => {
      const mockWorker = { ...mockWorkerSequelizeInstance };
      await unsetCWPRoleCategoryOnJobRoleChange(mockWorker);

      expect(mockWorker.CareWorkforcePathwayRoleCategoryFK).to.equal(null);
      expect(mockWorker.CWPRoleCategoryIsAlsoNominatedIndividual).to.equal(false);
    });

    it('should keep carryOutDelegatedHealthcareActivities unchanged if new job role is included in CareWorkforcePathway', async () => {
      const mockWorker = {
        ...mockWorkerSequelizeInstance,
        getMainJob() {
          return Promise.resolve({ id: 10, title: 'Care worker', excludedFromCareWorkforcePathway: false });
        },
      };

      await unsetCWPRoleCategoryOnJobRoleChange(mockWorker);

      expect(mockWorker.CareWorkforcePathwayRoleCategoryFK).to.deep.equal(7);
      expect(mockWorker.CWPRoleCategoryIsAlsoNominatedIndividual).to.deep.equal(true);
    });

    it('should do nothing if not changing the main job', async () => {
      const mockWorker = {
        ...mockWorkerSequelizeInstance,
        changed: () => {
          return false;
        },
        getMainJob: sinon.stub(),
      };

      await unsetCWPRoleCategoryOnJobRoleChange(mockWorker);

      expect(mockWorker.getMainJob).not.to.have.been.called;
      expect(mockWorker.CareWorkforcePathwayRoleCategoryFK).to.deep.equal(7);
      expect(mockWorker.CWPRoleCategoryIsAlsoNominatedIndividual).to.deep.equal(true);
    });
  });
});
