const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { registerAccount, saveUserToDatabase } = require('../../../../routes/registration/registerAccount');
const models = require('../../../../models');
const User = require('../../../../models/classes/user').User;

describe('registerAccount', async () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/registration',
      body: {
        establishment: {
          mainService: 'Care',
          isRegulated: false,
        },
        user: {
          password: 'validPassword0',
          username: 'username',
          email: 'testuser@email.com',
        },
      },
    };
    res = httpMocks.createResponse();

    sinon.stub(models.services, 'getMainServiceByName').callsFake(() => {
      return { id: 1, other: true };
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Request validation', () => {
    it('should return 400 and Parameters missing message when req body empty', async () => {
      req.body = {};

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('Parameters missing');
      expect(response.errCode).to.equal(-230);
    });

    it('should return 400 and invalid user message when no user in req body', async () => {
      req.body = { username: 'testuser' };

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('User data is invalid');
      expect(response.errCode).to.equal(-800);
    });

    it('should return 400 and invalid user message when user in req body is empty object', async () => {
      req.body = { user: {} };

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('User data is invalid');
      expect(response.errCode).to.equal(-800);
    });

    it('should return 400 and invalid password message when password is not valid', async () => {
      req.body = {
        user: {
          password: 'invalid',
        },
      };

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal(
        'Password must be at least 8 characters long and have uppercase letters, lowercase letters and numbers',
      );
      expect(response.errCode).to.equal(-220);
    });

    it('should return 400 and invalid username message when username is not valid', async () => {
      req.body = {
        user: {
          password: 'validPassword0',
          username: 'userName0123456!?!?!*&^%',
        },
      };

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('Invalid Username');
      expect(response.errCode).to.equal(-210);
    });
  });

  describe('Main service errors', async () => {
    it('should return 400 and unexpected main service message when main service cannot be found in database', async () => {
      models.services.getMainServiceByName.restore();
      sinon.stub(models.services, 'getMainServiceByName').callsFake(() => {
        return null;
      });

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Unexpected main service');
      expect(response.status).to.equal(-300);
    });

    it('should return 400 and unexpected main service message mainServiceOther is greater than 120 chars', async () => {
      req.body.establishment.mainServiceOther =
        'This is a really really really really really really really really really really really really really really really really really really really long other service';

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Unexpected main service');
      expect(response.status).to.equal(-300);
    });
  });
});

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

      expect(error.errCode).to.equal(-800);
      expect(error.errMessage).to.equal('User data is invalid');
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
