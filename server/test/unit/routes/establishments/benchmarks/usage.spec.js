const models = require('../../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const benchmarksUsage = require('../../../../../routes/establishments/benchmarks/usage');
const httpMocks = require('node-mocks-http');
const moment = require('moment');

describe('usage', () => {
  let request;
  let benchmarksUsageStub;

  beforeEach(() => {
    benchmarksUsageStub = sinon.stub(models.benchmarksViewed, 'create');
    request = {
      method: 'POST',
      url: '/api/establishment/85b2a783-ff2d-4c83-adba-c25378afa19c/benchmarks/usage',
      establishmentId: 1234,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 when a benchmark usage has been successfully logged', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    const viewedTime = moment();

    await benchmarksUsage.postBenchmarkTabUsage(req, res);

    expect(res.statusCode).to.deep.equal(200);
    benchmarksUsageStub.should.have.been.calledWith({
      EstablishmentID: request.establishmentId,
      ViewedTime: viewedTime,
    });
  });
});
