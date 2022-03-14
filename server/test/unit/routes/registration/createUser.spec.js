const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const { saveUserToDatabase } = require('../../../../routes/registration/createUser');
const User = require('../../../../models/classes/user').User;

describe('createUser', () => {
  describe('saveUserToDatabase', () => {
    let userData;
    let newUser;
    let saveStub;

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

      newUser = new User('establishmentId');

      saveStub = sinon.stub(newUser, 'save').callsFake(() => {
        return 12345;
      });
    });

    it('should call the save function on newUser when valid userData is passed in', async () => {
      await saveUserToDatabase(userData, newUser);

      expect(saveStub.called).to.equal(true);
    });

    it('should throw a user data is invalid error when invalid userData passed in', async () => {
      userData.password = 'invalid';

      let error = null;
      try {
        await saveUserToDatabase(userData, newUser);
      } catch (err) {
        error = err;
      }

      expect(error.message).to.equal('User data is invalid');
    });

    it('should not call save function on newUser when invalid userData data passed in', async () => {
      userData.password = 'invalid';

      try {
        await saveUserToDatabase(userData, newUser);
      } catch (err) {
        return;
      }

      expect(saveStub.called).to.equal(false);
    });
  });
});
