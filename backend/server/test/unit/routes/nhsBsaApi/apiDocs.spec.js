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

  it('should return 200 code with content-type header set to yaml when no errors', () => {
    nhsBsaApiDocumentation(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res.getHeader('Content-Type')).to.equal('application/x-yaml');
  });

  it('should return contents of yaml file when no errors', () => {
    nhsBsaApiDocumentation(req, res);

    expect(res._getData()).to.include('openapi: 3.1.0');
    expect(res._getData()).to.include('title: ASC-WDS API for NHSBSA');
  });

  it('should return 500 when an error is thrown when reading yaml file', () => {
    sinon.stub(fs, 'readFileSync').throws();

    nhsBsaApiDocumentation(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
