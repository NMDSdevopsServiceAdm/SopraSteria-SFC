const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const sns = require('../../../../aws/sns');
const { removeSensitiveData, postRegistrationToSlack } = require('../../../../routes/registration/slack');

describe('slack', () => {
  let userData;
  let req;
  let establishmentInfo;

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

    establishmentInfo = {
      uid: 'c21321321312321321',
      nmdsId: 'J31323812',
    };

    req = {
      body: {
        user: userData,
        establishment: {
          id: 1234,
          addressLine1: '12 Somewhere Street',
          addressLine2: 'Somewhere',
          addressLine3: 'Somwhere but adressline 3',
          townCity: 'Valhalla',
        },
      },
    };
  });

  describe('postRegistrationToSlack()', () => {
    it('Should call sns.postToRegistrations with expected data', () => {
      const postToRegistrations = sinon.stub(sns, 'postToRegistrations').returns(null);

      postRegistrationToSlack(req, establishmentInfo);

      expect(postToRegistrations.called).to.equal(true);
      expect(
        postToRegistrations.calledWith({
          id: 1234,
          addressLine1: '12 Somewhere Street',
          addressLine2: 'Somewhere',
          addressLine3: 'Somwhere but adressline 3',
          townCity: 'Valhalla',
          establishmentUid: 'c21321321312321321',
          nmdsId: 'J31323812',

          user: {
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
          },
        }),
      ).to.equal(true);
    });
  });

  describe('removeSensitiveData()', () => {
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
