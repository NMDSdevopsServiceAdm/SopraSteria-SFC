const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
// const httpMocks = require('node-mocks-http');
const config = require('../../../../../config/config');

const { generateToken } = require('../../../../../../server/routes/wdf/grantLetter/echoSign');

describe.only('GrantLetter', () => {
  const adobeSignBaseUrl = config.get('adobeSign.apiBaseUrl');
  let axiosStub;

  beforeEach(() => {
    axiosStub = sinon.stub(axios, 'post');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Adobe Signs Utils', () => {
    it('returns the generated token from adobe sign', async () => {
      axiosStub.resolves({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        api_access_point: 'https://api.eu2.adobesign.com/',
        web_access_point: 'https://secure.eu2.adobesign.com/',
        token_type: 'Bearer',
        expires_in: 3600,
      });

      const token = await generateToken();

      expect(axiosStub).to.have.been.calledOnceWith(`${adobeSignBaseUrl}/oauth/v2/token`);
      expect(token).to.equal('access_token');
    });

    it('returns a token error message if Adobe Sign fails to return a token', async () => {
      axiosStub.resolves({
        message: 'something wrong',
      });

      const output = await generateToken();

      expect(axiosStub).to.have.been.calledOnceWith(`${adobeSignBaseUrl}/oauth/v2/token`);
      expect(output.message).to.equal('token not returned');
    });

    it('returns error returned if Adobe Sign API call fails', async () => {
      axiosStub.rejects(Error('some error returned'));

      const output = await generateToken();

      expect(axiosStub).to.have.been.calledOnceWith(`${adobeSignBaseUrl}/oauth/v2/token`);
      expect(output.message).to.equal('some error returned');
    });
  });
});
