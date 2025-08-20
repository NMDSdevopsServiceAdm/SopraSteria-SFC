const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const Establishment = require('../../../../models/classes/establishment');
const updateStaffKindDelegatedHealthcareActivities = require('../../../../routes/establishments/updateStaffKindDelegatedHealthcareActivities');

describe('updateStaffKindDelegatedHealthcareActivities', () => {
  let mockEstablishmentInstance;

  const mockRequest = {
    method: 'POST',
    url: '/api/establishment/mock-workplace-uid/updateStaffKindDelegatedHealthcareActivities',
    establishmentId: 'mock-workplace-uid',
    body: {
      knowWhatActivities: 'Yes',
      activities: [{ id: 1 }, { id: 2 }],
    },
  };

  beforeEach(() => {
    mockEstablishmentInstance = sinon.createStubInstance(Establishment.Establishment);
    sinon.stub(Establishment, 'Establishment').callsFake(() => mockEstablishmentInstance);
    sinon.stub(console, 'error'); // supress error msg in test log
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update the staffKindDelegatedHealthcareActivities and respond with 200', async () => {
    mockEstablishmentInstance.restore = sinon.stub().resolves(true);
    mockEstablishmentInstance.load = sinon.stub().resolves(true);

    const req = httpMocks.createRequest(mockRequest);
    const res = httpMocks.createResponse();

    await updateStaffKindDelegatedHealthcareActivities(req, res);

    expect(mockEstablishmentInstance.restore).to.have.been.calledWith('mock-workplace-uid');

    expect(mockEstablishmentInstance.load).to.have.been.calledWith({
      staffWhatKindDelegatedHealthcareActivities: {
        knowWhatActivities: 'Yes',
        activities: [{ id: 1 }, { id: 2 }],
      },
    });
    expect(mockEstablishmentInstance.save).to.have.been.called;

    expect(res.statusCode).to.equal(200);
  });

  it('should respond with 404 if establishment could not be found', async () => {
    mockEstablishmentInstance.restore = sinon.stub().resolves(false);

    const req = httpMocks.createRequest(mockRequest);
    const res = httpMocks.createResponse();

    await updateStaffKindDelegatedHealthcareActivities(req, res);

    expect(mockEstablishmentInstance.restore).to.have.been.calledWith('mock-workplace-uid');
    expect(mockEstablishmentInstance.load).not.to.have.been.called;
    expect(mockEstablishmentInstance.save).not.to.have.been.called;

    expect(res.statusCode).to.equal(404);
  });

  it('should respond with 400 error if failed to update staffKindDelegatedHealthcareActivities', async () => {
    mockEstablishmentInstance.restore = sinon.stub().resolves(true);
    mockEstablishmentInstance.load = sinon.stub().resolves(false);

    const req = httpMocks.createRequest(mockRequest);
    const res = httpMocks.createResponse();

    await updateStaffKindDelegatedHealthcareActivities(req, res);

    expect(mockEstablishmentInstance.save).not.to.have.been.called;

    expect(res.statusCode).to.equal(400);
  });

  it('should respond with 500 error if some other errors occured during operation', async () => {
    mockEstablishmentInstance.restore = sinon.stub().throws();

    const req = httpMocks.createRequest(mockRequest);
    const res = httpMocks.createResponse();

    await updateStaffKindDelegatedHealthcareActivities(req, res);

    expect(mockEstablishmentInstance.save).not.to.have.been.called;

    expect(res.statusCode).to.equal(500);
  });
});
