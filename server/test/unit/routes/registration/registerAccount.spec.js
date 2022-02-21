const chai = require('chai');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');

const { registerAccount } = require('../../../../routes/registration/registerAccount');

describe('registerAccount', async () => {
  describe('Request validation', () => {
    it('should return 400 and Parameters missing message when req body empty', async () => {
      const request = {
        method: 'GET',
        url: '/api/registration',
        body: {},
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Parameters missing');
    });

    it('should return 400 and invalid password message when password not valid', async () => {
      const request = {
        method: 'GET',
        url: '/api/registration',
        body: [
          {
            user: {
              password: 'invalid',
            },
          },
        ],
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal(
        'Password must be at least 8 characters long and have uppercase letters, lowercase letters and numbers',
      );
    });
  });
});
