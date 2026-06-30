const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../models/index');

describe('user model', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('updateFlags', () => {
    const mockUserLoginObject = {
      update: () => {},
    };
    const mockUserObject = {
      update: () => {},
      getLogin: () => mockUserLoginObject,
    };

    beforeEach(() => {
      sinon.stub(models.user, 'findOne').resolves(mockUserObject);
      sinon.stub(mockUserObject, 'update');
      sinon.stub(mockUserLoginObject, 'update');
    });

    it('should update the flag of a user', async () => {
      await models.user.updateFlags('mock-uid', { registrationSurveyCompleted: true });

      expect(models.user.findOne).to.have.been.calledWith({ where: { uid: 'mock-uid' } });
      expect(mockUserObject.update).to.have.been.calledWith({ registrationSurveyCompleted: true });
    });

    it('should handle more than one flags', async () => {
      await models.user.updateFlags('mock-uid', {
        registrationSurveyCompleted: true,
        trainingCoursesMessageViewedQuantity: 10,
      });

      expect(models.user.findOne).to.have.been.calledWith({ where: { uid: 'mock-uid' } });
      expect(mockUserObject.update).to.have.been.calledWith({
        registrationSurveyCompleted: true,
        trainingCoursesMessageViewedQuantity: 10,
      });
    });

    it('should ignore any unexpected fields', async () => {
      await models.user.updateFlags('mock-uid', {
        role: 'Admin',
        password: 'attempt-to-pwn-user-password',
      });

      expect(models.user.findOne).to.have.been.calledWith({ where: { uid: 'mock-uid' } });
      expect(mockUserObject.update).to.have.been.calledWith({});
      expect(mockUserLoginObject.update).not.to.have.been.called;
    });

    it('should handle the special case of agreedUpdatedTerms (a legacy flag that is store in login table)', async () => {
      await models.user.updateFlags('mock-uid', {
        agreedUpdatedTerms: true,
      });

      expect(models.user.findOne).to.have.been.calledWith({ where: { uid: 'mock-uid' } });
      expect(mockUserObject.update).to.have.been.calledWith({});
      expect(mockUserLoginObject.update).to.have.been.calledWith({ agreedUpdatedTerms: true });
    });

    it('should do nothing if the user was not found', async () => {
      models.user.findOne.restore();
      sinon.stub(models.user, 'findOne').resolves(null);

      await models.user.updateFlags('mock-uid-non-exist', {
        registrationSurveyCompleted: true,
      });

      expect(models.user.findOne).to.have.been.calledWith({ where: { uid: 'mock-uid-non-exist' } });
      expect(mockUserObject.update).not.to.have.been.called;
      expect(mockUserLoginObject.update).not.to.have.been.called;
    });
  });
});
