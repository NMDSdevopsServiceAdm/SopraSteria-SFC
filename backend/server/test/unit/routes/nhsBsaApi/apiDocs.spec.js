const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const fs = require('fs');

const { nhsBsaApiDocumentation } = require('../../../../routes/nhsBsaApi/apiDocs');

describe('server/routes/nhsBsaApi/apiDocs.js', () => {
  beforeEach(() => {
    const request = {
      method: 'GET',
      url: '/api/v1/api-docs',
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 500 when an error is thrown when reading yaml file', async () => {
    sinon.stub(fs, 'readFile').throws();
    await nhsBsaApiDocumentation(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
