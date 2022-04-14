const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const establishment = require('../../../../routes/registration/createEstablishment');
const user = require('../../../../routes/registration/createUser');
const RegistrationException = require('../../../../routes/registration/registrationErrors').RegistrationException;
const { registerAccountWithTransaction } = require('../../../../routes/registration/registerAccount');
const slack = require('../../../../routes/registration/slack');
const EstablishmentSaveException =
  require('../../../../models/classes/establishment/establishmentExceptions').EstablishmentSaveException;
const UserSaveException = require('../../../../models/classes/user/userExceptions').UserSaveException;

describe('registerAccountWithTransaction', async () => {
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
          password: 'validPassword0!',
          username: 'username',
          email: 'testuser@email.com',
        },
      },
      sqreen: {
        signup_track() {},
      },
    };
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Request validation', () => {
    it('should return 400 and Parameters missing message when req body empty', async () => {
      req.body = {};

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Parameters missing');
    });

    it('should return 400 and invalid user message when no user in req body', async () => {
      req.body = { username: 'testuser' };

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('User data is invalid');
    });

    it('should return 400 and invalid user message when user in req body is empty object', async () => {
      req.body = { user: {} };

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('User data is invalid');
    });

    it('should return 400 and invalid password message when password is not valid', async () => {
      req.body = {
        user: {
          password: 'invalid',
        },
      };

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal(
        'Password must be at least 8 characters long and have uppercase letters, lowercase letters, numbers and special characters like !, £',
      );
    });

    it('should return 400 and invalid username message when username is not valid', async () => {
      req.body = {
        user: {
          password: 'validPassword0!',
          username: 'userName0123456!?!?!*&^%',
        },
      };

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Invalid Username');
    });
  });

  describe('Handling exceptions', () => {
    it('should return a 400 status with exception message if EstablishmentSaveException is thrown in createEstablishment', async () => {
      sinon.stub(establishment, 'createEstablishment').callsFake(() => {
        throw new EstablishmentSaveException(123, 'c123', 'Bob', 'Invalid establishment properties');
      });

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Invalid establishment properties');
    });

    it('should return a 400 status with exception message if RegistrationException is thrown in createEstablishment', async () => {
      sinon.stub(establishment, 'createEstablishment').callsFake(() => {
        throw new RegistrationException('Unexpected main service');
      });

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Unexpected main service');
    });

    it('should return a 400 status with exception message if UserSaveException is thrown in createUser', async () => {
      sinon.stub(establishment, 'createEstablishment').callsFake(() => {
        return { uid: 132 };
      });

      sinon.stub(user, 'createUser').callsFake(() => {
        throw new UserSaveException(123, 'c123', 'Bob', 'Duplicate Username');
      });

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Duplicate Username');
    });

    it('should return a 500 status with Unexpected problem with registration message if unexpected error is thrown', async () => {
      sinon.stub(establishment, 'createEstablishment').callsFake(() => {
        throw new Error('We have no idea what happened');
      });

      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(500);
      expect(response.message).to.equal('Unexpected problem with registration');
    });
  });

  describe('Registration completion', () => {
    beforeEach(() => {
      sinon.stub(establishment, 'createEstablishment').callsFake(() => {
        return { uid: 'a413' };
      });

      sinon.stub(user, 'createUser').callsFake(() => {
        return { uid: 'c1234', status: 'PENDING' };
      });
    });

    it('should call req.sqreen.signup_track with returned user and establishment uids', async () => {
      const signupTrackSpy = sinon.spy(req.sqreen, 'signup_track');

      await registerAccountWithTransaction(req, res);

      expect(signupTrackSpy.getCall(0).args[0]).to.deep.equal({ userId: 'c1234', establishmentId: 'a413' });
    });

    it('should respond with 200, returned userStatus and succesfully created message', async () => {
      await registerAccountWithTransaction(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(200);
      expect(response.userStatus).to.equal('PENDING');
      expect(response.message).to.equal('Establishment and primary user successfully created');
    });

    it('should call postRegistrationToSlack with request and establishmentInfo', async () => {
      const postRegistrationToSlackStub = sinon.stub(slack, 'postRegistrationToSlack').returns(null);

      await registerAccountWithTransaction(req, res);

      expect(postRegistrationToSlackStub.getCall(0).args[0]).to.deep.equal(req);
      expect(postRegistrationToSlackStub.getCall(0).args[1]).to.deep.equal({ uid: 'a413' });
    });
  });
});
