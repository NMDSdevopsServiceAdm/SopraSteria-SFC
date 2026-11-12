const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../models/index');
const { editWorkerAsAdmin } = require('../../../../routes/establishments/editWorkerAsAdmin');

describe('editWorkerAsAdmin', () => {
  let worker;
  let findWorkerSpy;
  let updateWorkerWithAdminOverridesSpy;

  beforeEach(() => {
    updateWorkerWithAdminOverridesSpy = sinon
      .stub()
      .callsFake((sequelizeChanges, _workerClassChanges) => sequelizeChanges);
    worker = {
      updateWorkerWithAdminOverrides: updateWorkerWithAdminOverridesSpy,
    };

    findWorkerSpy = sinon.stub(models.worker, 'findOne').resolves(worker);
  });

  afterEach(() => {
    sinon.restore();
  });

  const mockEstablishmentId = 123;

  const request = {
    method: 'PUT',
    url: '/api/establishment/:uid/worker/:workerUid/asAdmin',
    params: {
      id: 'mock-uid',
      workerId: 'mock-worker-uid',
    },
    body: { annualHourlyPay: { value: 'Annually', rate: 200000 } },
    establishmentId: mockEstablishmentId,
  };

  it('should respond with 200 and updated worker field', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await editWorkerAsAdmin(req, res);

    expect(res.statusCode).to.deep.equal(200);

    expect(worker.updateWorkerWithAdminOverrides).to.have.been.calledWith(
      { AnnualHourlyPayValue: 'Annually', AnnualHourlyPayRate: 200000 },
      { annualHourlyPay: { value: 'Annually', rate: 200000 } },
    );
  });

  it('should respond with 404 if worker not found', async () => {
    findWorkerSpy.restore();
    sinon.stub(models.worker, 'findOne').resolves(null);
    sinon.stub(console, 'error');

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await editWorkerAsAdmin(req, res);

    expect(res.statusCode).to.deep.equal(404);

    expect(worker.updateWorkerWithAdminOverrides).not.to.have.been.called;
  });

  it('should respond with 500 if error occured', async () => {
    worker.updateWorkerWithAdminOverrides.rejects(new Error('some database error'));
    sinon.stub(console, 'error');

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await editWorkerAsAdmin(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
