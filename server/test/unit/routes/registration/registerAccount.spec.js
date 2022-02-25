const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const establishment = require('../../../../routes/registration/createEstablishment');
const { registerAccount } = require('../../../../routes/registration/registerAccount');
const EstablishmentSaveException =
  require('../../../../models/classes/establishment/establishmentExceptions').EstablishmentSaveException;

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

  describe('Handling exceptions', () => {
    it('Should return a 400 status with exception message if EstablishmentSaveException is thrown', async () => {
      sinon.stub(establishment, 'createEstablishment').callsFake(() => {
        throw new EstablishmentSaveException(123, 'c123', 'Bob', 'Invalid establishment properties');
      });

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Invalid establishment properties');
    });
  });
});
