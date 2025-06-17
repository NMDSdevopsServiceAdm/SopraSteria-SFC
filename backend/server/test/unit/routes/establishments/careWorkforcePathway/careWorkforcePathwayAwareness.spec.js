const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Establishment = require('../../../../../models/classes/establishment');

const {
  updateCareWorkforcePathwayAwareness,
} = require('../../../../../routes/establishments/careWorkforcePathway/careWorkforcePathwayAwareness');

describe('server/routes/establishments/careWorkforcePathway/CareWorkforcePathwayAwareness', () => {
  const establishmentId = 'mock-uid';

  let establishmentRecord;
  const mockRequest = {
    method: 'POST',
    url: `/api/establishment/${establishmentId}/careWorkforcePathway/careWorkforcePathwayAwareness`,
    establishmentId: establishmentId,
    body: { careWorkforcePathwayWorkplaceAwareness: { id: 1 } },
    username: 'user',
  };

  const awareAnswers = [1, 2, 3];
  const notAwareAnswers = [4, 5];

  beforeEach(() => {
    establishmentRecord = sinon.createStubInstance(Establishment.Establishment);
    sinon.stub(Establishment, 'Establishment').callsFake(() => establishmentRecord);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update and respond with 200 status', async () => {
    establishmentRecord.restore = sinon.stub().resolves(true);
    establishmentRecord.load = sinon.stub().resolves(true);
    establishmentRecord.save = sinon.stub().resolves(true);

    const req = httpMocks.createRequest(mockRequest);
    const res = httpMocks.createResponse();
    await updateCareWorkforcePathwayAwareness(req, res);

    expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
    expect(establishmentRecord.load).to.have.been.calledWith(mockRequest.body);
    expect(establishmentRecord.save).to.have.been.called;
    expect(res.statusCode).to.equal(200);
  });

  awareAnswers.forEach((awareAnswer) => {
    it(`should not call the load function with careWorkforcePathwayUse when the value is ${awareAnswer}`, async () => {
      mockRequest.body.careWorkforcePathwayWorkplaceAwareness.id = awareAnswer;

      establishmentRecord.restore = sinon.stub().resolves(true);
      establishmentRecord.load = sinon.stub().resolves(true);
      establishmentRecord.save = sinon.stub().resolves(true);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateCareWorkforcePathwayAwareness(req, res);

      expect(establishmentRecord.load).to.have.been.calledWith(mockRequest.body);
      expect(res.statusCode).to.equal(200);
    });
  });

  notAwareAnswers.forEach((awareAnswer) => {
    it(`should call the load function with careWorkforcePathwayUse when the value is ${awareAnswer}`, async () => {
      mockRequest.body.careWorkforcePathwayWorkplaceAwareness.id = awareAnswer;

      establishmentRecord.restore = sinon.stub().resolves(true);
      establishmentRecord.load = sinon.stub().resolves(true);
      establishmentRecord.save = sinon.stub().resolves(true);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateCareWorkforcePathwayAwareness(req, res);

      expect(establishmentRecord.load).to.have.been.calledWith({
        careWorkforcePathwayWorkplaceAwareness: mockRequest.body.careWorkforcePathwayWorkplaceAwareness,
        careWorkforcePathwayUse: { use: null, reasons: [] },
      });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('errors', () => {
    it('should respond with 404 if the establishment is not found', async () => {
      establishmentRecord.restore = sinon.stub().resolves(false);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateCareWorkforcePathwayAwareness(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
      expect(establishmentRecord.load).not.to.have.been.called;
      expect(establishmentRecord.save).not.to.have.been.called;
      expect(res.statusCode).to.equal(404);
    });

    it('should respond with 400 if it failed to update', async () => {
      mockRequest.body.careWorkforcePathwayWorkplaceAwareness.id = 1;
      establishmentRecord.restore = sinon.stub().resolves(true);
      establishmentRecord.load = sinon.stub().resolves(false);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateCareWorkforcePathwayAwareness(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
      expect(establishmentRecord.load).to.have.been.calledWith(mockRequest.body);
      expect(establishmentRecord.save).not.to.have.been.called;

      expect(res.statusCode).to.equal(400);
    });

    it('should respond with 500 when there is an unexpected error', async () => {
      establishmentRecord.restore = sinon.stub().throws();

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateCareWorkforcePathwayAwareness(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
