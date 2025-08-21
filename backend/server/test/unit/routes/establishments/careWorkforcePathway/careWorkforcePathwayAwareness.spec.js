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

  let mockRequest;

  const setupMockRequest = (awarenessId = 1) => {
    mockRequest = {
      method: 'POST',
      url: `/api/establishment/${establishmentId}/careWorkforcePathway/careWorkforcePathwayAwareness`,
      establishmentId: establishmentId,
      body: { careWorkforcePathwayWorkplaceAwareness: { id: awarenessId } },
      username: 'user',
    };
  };

  const awareAnswers = [1, 2, 3];
  const notAwareAnswers = [4, 5];

  const mockCWPUseValue = (useValue) => {
    establishmentRecord._careWorkforcePathwayUse = useValue ?? null;
  };

  beforeEach(() => {
    establishmentRecord = sinon.createStubInstance(Establishment.Establishment);
    sinon.stub(Establishment, 'Establishment').callsFake(() => establishmentRecord);
    setupMockRequest();
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

  describe('When careWorkforcePathwayUse is null, it should not change careWorkforcePathwayUse', () => {
    beforeEach(() => {
      mockCWPUseValue(null);
    });

    [...awareAnswers, ...notAwareAnswers].forEach((awarenessAnswer) => {
      it(`awareness answer: ${awarenessAnswer}`, async () => {
        setupMockRequest(awarenessAnswer);

        establishmentRecord.restore = sinon.stub().resolves(true);
        establishmentRecord.load = sinon.stub().resolves(true);
        establishmentRecord.save = sinon.stub().resolves(true);

        const req = httpMocks.createRequest(mockRequest);
        const res = httpMocks.createResponse();
        await updateCareWorkforcePathwayAwareness(req, res);

        expect(establishmentRecord.load).to.have.been.calledWith({
          careWorkforcePathwayWorkplaceAwareness: { id: awarenessAnswer },
        });
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('When careWorkforcePathwayUse is not null, it should set careWorkforcePathwayUse to null only when awareness is falsy', () => {
    beforeEach(() => {
      mockCWPUseValue('Yes');
    });

    awareAnswers.forEach((awarenessAnswer) => {
      it(`awareness answer: ${awarenessAnswer}, should not change careWorkforcePathwayUse`, async () => {
        setupMockRequest(awarenessAnswer);

        establishmentRecord.restore = sinon.stub().resolves(true);
        establishmentRecord.load = sinon.stub().resolves(true);
        establishmentRecord.save = sinon.stub().resolves(true);

        const req = httpMocks.createRequest(mockRequest);
        const res = httpMocks.createResponse();
        await updateCareWorkforcePathwayAwareness(req, res);

        expect(establishmentRecord.load).to.have.been.calledWith({
          careWorkforcePathwayWorkplaceAwareness: { id: awarenessAnswer },
        });
        expect(res.statusCode).to.equal(200);
      });
    });

    notAwareAnswers.forEach((awarenessAnswer) => {
      it(`awareness answer: ${awarenessAnswer}, should change careWorkforcePathwayUse to null`, async () => {
        setupMockRequest(awarenessAnswer);

        establishmentRecord.restore = sinon.stub().resolves(true);
        establishmentRecord.load = sinon.stub().resolves(true);
        establishmentRecord.save = sinon.stub().resolves(true);

        const req = httpMocks.createRequest(mockRequest);
        const res = httpMocks.createResponse();
        await updateCareWorkforcePathwayAwareness(req, res);

        expect(establishmentRecord.load).to.have.been.calledWith({
          careWorkforcePathwayWorkplaceAwareness: { id: awarenessAnswer },
          careWorkforcePathwayUse: { use: null, reasons: [] },
        });
        expect(res.statusCode).to.equal(200);
      });
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
