const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');
const {
  checkIfAnyWorkerHasDHAAnswered,
} = require('../../../../../routes/establishments/delegatedHealthcareActivities/checkIfAnyWorkerHasDHAAnswered');

describe('GET /establishment/:uid/delegatedHealthcareActivities/checkIfAnyWorkerHasDHAAnswered', () => {
  afterEach(() => {
    sinon.restore();
  });

  const establishmentUid = 'mock-uid';
  const establishmentId = 'mock-id';

  const request = {
    method: 'GET',
    url: `/api/establishment/${establishmentUid}/delegatedHealthcareActivities/checkIfAnyWorkerHasDHAAnswered`,
    establishmentId,
  };

  it('should return 200 and {hasAnswer: true} when at least one worker in the workplace has DHA question answered', async () => {
    sinon.stub(models.worker, 'checkIfAnyWorkerHasDHAAnswered').resolves(true);

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await checkIfAnyWorkerHasDHAAnswered(req, res);

    const response = res._getData();

    expect(res.statusCode).to.deep.equal(200);
    expect(response).to.deep.equal({ hasAnswer: true });
    expect(models.worker.checkIfAnyWorkerHasDHAAnswered).to.have.been.calledWith(establishmentId);
  });

  it('should return 200 and {hasAnswer: false} when none of the workers in the workplace has DHA question answered', async () => {
    sinon.stub(models.worker, 'checkIfAnyWorkerHasDHAAnswered').resolves(false);

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await checkIfAnyWorkerHasDHAAnswered(req, res);

    const response = res._getData();

    expect(res.statusCode).to.deep.equal(200);
    expect(response).to.deep.equal({ hasAnswer: false });
    expect(models.worker.checkIfAnyWorkerHasDHAAnswered).to.have.been.calledWith(establishmentId);
  });

  it('should return 500 if error occured when querying worker data', async () => {
    sinon.stub(console, 'error'); // supress error msg in test log

    sinon.stub(models.worker, 'checkIfAnyWorkerHasDHAAnswered').rejects(new Error('some database error'));

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await checkIfAnyWorkerHasDHAAnswered(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
