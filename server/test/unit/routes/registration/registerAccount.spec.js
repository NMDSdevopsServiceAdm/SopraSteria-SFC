const chai = require('chai');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');

const { registerAccount } = require('../../../../routes/registration/registerAccount');

describe('registerAccount', async () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/registration',
    };
    res = httpMocks.createResponse();
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
      req.body = [{}];

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('User data is invalid');
      expect(response.errCode).to.equal(-800);
    });

    it('should return 400 and invalid user message when user in req body is empty object', async () => {
      req.body = [{ user: {} }];

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('User data is invalid');
      expect(response.errCode).to.equal(-800);
    });

    it('should return 400 and invalid password message when password is not valid', async () => {
      req.body = [
        {
          user: {
            password: 'invalid',
          },
        },
      ];

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal(
        'Password must be at least 8 characters long and have uppercase letters, lowercase letters and numbers',
      );
      expect(response.errCode).to.equal(-220);
    });

    it('should return 400 and invalid username message when username is not valid', async () => {
      req.body = [
        {
          user: {
            password: 'validPassword0',
            username: 'userName0123456!?!?!*&^%',
          },
        },
      ];

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('Invalid Username');
      expect(response.errCode).to.equal(-210);
    });
  });
});
