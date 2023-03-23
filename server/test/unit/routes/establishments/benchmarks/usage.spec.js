const models = require('../../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const benchmarksUsage = require('../../../../../routes/establishments/benchmarks/usage');
const httpMocks = require('node-mocks-http');

describe('usage', () => {
  let request;
  let benchmarksUsageStub;
  const date = new Date();
  beforeEach(() => {
    benchmarksUsageStub = sinon.stub(models.benchmarksViewed, 'create').returns(null);
    request = {
      method: 'POST',
      url: '/api/establishment/85b2a783-ff2d-4c83-adba-c25378afa19c/benchmarks/usage',
      establishmentId: 1234,
      body: { viewedTime: date },
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 when a benchmark usage has been successfully logged', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await benchmarksUsage.postBenchmarkTabUsage(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should call create on benchmarksViewed model with current time and establishment id from request', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await benchmarksUsage.postBenchmarkTabUsage(req, res);

    const createParams = benchmarksUsageStub.getCall(0).args[0];

    expect(createParams.ViewedTime).to.deep.equal(date);
    expect(createParams.EstablishmentID).to.deep.equal(request.establishmentId);
  });
});
