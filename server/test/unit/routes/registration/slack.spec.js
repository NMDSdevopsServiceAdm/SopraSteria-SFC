const chai = require('chai');
const expect = chai.expect;

const { removeSensitiveData } = require('../../../../routes/registration/slack');

describe('slack', () => {
  describe('removeSensitiveData', () => {
    let userData;

    beforeEach(() => {
      userData = {
        email: 'testuser@email.com',
        username: 'testuser',
        password: 'Password1!',
        fullname: 'Bob',
        jobTitle: 'Bob',
        phone: '043243242343',
        securityQuestion: 'What is your favourite colour?',
        securityQuestionAnswer: 'Blue',
        canManageWdfClaims: false,
        isActive: false,
        status: 'PENDING',
        role: 'Edit',
        isPrimary: true,
        registrationSurveyCompleted: false,
      };
    });

    it('should return userData object with password deleted', () => {
      const returnedData = removeSensitiveData(userData);

      expect(returnedData.password).to.equal(undefined);
    });

    it('should return userData object with securityQuestion deleted', () => {
      const returnedData = removeSensitiveData(userData);

      expect(returnedData.securityQuestion).to.equal(undefined);
    });

    it('should return userData object with securityQuestionAnswer deleted', () => {
      const returnedData = removeSensitiveData(userData);

      expect(returnedData.securityQuestionAnswer).to.equal(undefined);
    });

    it('should return userData object with all other fields from original userData', () => {
      const returnedData = removeSensitiveData(userData);

      expect(returnedData).to.deep.equal({
        email: 'testuser@email.com',
        username: 'testuser',
        fullname: 'Bob',
        jobTitle: 'Bob',
        phone: '043243242343',
        canManageWdfClaims: false,
        isActive: false,
        status: 'PENDING',
        role: 'Edit',
        isPrimary: true,
        registrationSurveyCompleted: false,
      });
    });
  });
});
