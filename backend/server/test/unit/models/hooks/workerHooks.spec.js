const expect = require('chai').expect;
const sinon = require('sinon');

const { unsetDHAAnswerOnJobRoleChange } = require('../../../../models/hooks/workerHooks');

describe('Worker sequelize hooks', () => {
  describe('beforeSave: unsetDHAAnswerOnJobRoleChange', () => {
    afterEach(() => {
      sinon.restore();
    });

    const defaultWorkerInstance = {
      changed: (fieldName) => {
        return ['MainJobFkValue', 'updated'].includes(fieldName);
      },
      carryOutDelegatedHealthcareActivities: 'Yes',
      getMainJob() {
        return Promise.resolve({ id: 36, title: 'IT manager', canDoDelegatedHealthcareActivities: null });
      },
    };

    it('should set carryOutDelegatedHealthcareActivities to null if new job role cannot do DHA', async () => {
      const mockWorker = { ...defaultWorkerInstance };
      await unsetDHAAnswerOnJobRoleChange(mockWorker);

      expect(mockWorker.carryOutDelegatedHealthcareActivities).to.equal(null);
    });

    it('should keep carryOutDelegatedHealthcareActivities unchanged if new job role can do DHA', async () => {
      const mockWorker = {
        ...defaultWorkerInstance,
        getMainJob() {
          return Promise.resolve({ id: 10, title: 'Care worker', canDoDelegatedHealthcareActivities: true });
        },
      };

      await unsetDHAAnswerOnJobRoleChange(mockWorker);

      expect(mockWorker.carryOutDelegatedHealthcareActivities).to.equal('Yes');
    });

    it('should do nothing if not changing the main job', async () => {
      const mockWorker = {
        ...defaultWorkerInstance,
        changed: () => {
          return false;
        },
        getMainJob: sinon.stub(),
      };

      await unsetDHAAnswerOnJobRoleChange(mockWorker);

      expect(mockWorker.getMainJob).not.to.have.been.called;
    });
  });
});
