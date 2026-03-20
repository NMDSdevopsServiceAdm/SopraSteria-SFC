const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Establishment = require('../../../../models/classes/establishment');
const {
  getEstablishmentField,
  updateEstablishmentFieldWithAudit,
} = require('../../../../routes/establishments/establishmentField');

describe('server/routes/establishments/establishmentField', () => {
  const establishmentId = 'mock-id';
  let establishmentRecord;
  const property = 'EmployerType';

  beforeEach(() => {
    establishmentRecord = sinon.createStubInstance(Establishment.Establishment);
    sinon.stub(Establishment, 'Establishment').callsFake(() => establishmentRecord);
    sinon.stub(console, 'error'); // supress error msg in test log
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getEstablishmentField', () => {
    let mockRequest;
    const setupTests = (propertyToRequest = property) => {
      mockRequest = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/establishmentField`,
        establishmentId: establishmentId,
        username: 'user',
        params: { property: propertyToRequest },
      };
    };

    it('should respond with 200 and return the value on the requested property', async () => {
      establishmentRecord.restore = sinon.stub().resolves(true);

      setupTests();
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await getEstablishmentField(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId, false);
      expect(res.statusCode).to.equal(200);
    });

    it('should return with 404 if the requested property is not on the allowed list', async () => {
      setupTests('Capacity');
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await getEstablishmentField(req, res);

      expect(establishmentRecord.restore).not.to.have.been.called;
      expect(res.statusCode).to.equal(404);
    });

    it('should respond with 404 if the establishment is not found', async () => {
      establishmentRecord.restore = sinon.stub().resolves(false);

      setupTests();
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await getEstablishmentField(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId, false);
      expect(res.statusCode).to.equal(404);
    });

    it('should respond with 500 when there is an unexpected error', async () => {
      establishmentRecord.restore = sinon.stub().throws();

      setupTests();
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await getEstablishmentField(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });

  describe('updateEstablishmentFieldWithAudit', () => {
    let mockRequest;

    const setupTests = (propertyToRequest = property) => {
      mockRequest = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/establishmentField`,
        establishmentId: establishmentId,
        username: 'user',
        body: { employerType: { value: 'Private Sector' } },
        params: { property: propertyToRequest },
      };
    };

    it('should update the property and return a 200 status', async () => {
      establishmentRecord.restore = sinon.stub().resolves(true);
      establishmentRecord.load = sinon.stub().resolves(true);
      establishmentRecord.save = sinon.stub().resolves(true);

      setupTests();
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
      expect(establishmentRecord.load).to.have.been.calledWith(req.body);
      expect(establishmentRecord.save).to.have.been.called;
      expect(res.statusCode).to.equal(200);
    });

    it('should accept the endpoint name starting with lowercase letter', async () => {
      establishmentRecord.restore = sinon.stub().resolves(true);
      establishmentRecord.load = sinon.stub().resolves(true);
      establishmentRecord.save = sinon.stub().resolves(true);

      setupTests('employerType'); // PUT /api/establishment/:uid/establishmentField/employerType

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
      expect(establishmentRecord.load).to.have.been.calledWith(req.body);
      expect(establishmentRecord.save).to.have.been.called;
      expect(res.statusCode).to.equal(200);
    });

    it('should add PensionContributionPercentage to filteredProperties if the property being updated is PensionContribution', async () => {
      establishmentRecord.restore = sinon.stub().resolves(true);
      establishmentRecord.load = sinon.stub().resolves(true);
      establishmentRecord.save = sinon.stub().resolves(true);
      establishmentRecord.toJSON = sinon.stub().resolves(true);

      setupTests('pensionContribution');

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(res.statusCode).to.equal(200);
      expect(establishmentRecord.toJSON).to.have.been.called;

      const filteredProperties = establishmentRecord.toJSON.getCall(0).args.at(-1);
      expect(filteredProperties).to.deep.equal(['Name', 'PensionContribution', 'PensionContributionPercentage']);
    });

    it('should return with 404 if the requested property to update is not on the allowed list', async () => {
      setupTests('Capacity');
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).not.to.have.been.called;
      expect(res.statusCode).to.equal(404);
    });

    it('should return with 400 if the param property name is allowed but request body contain non-allowed field', async () => {
      setupTests();
      mockRequest.body = { isRegulated: true, nmdsId: 'B1234567' };

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).not.to.have.been.called;
      expect(res.statusCode).to.equal(400);
    });

    it('should respond with 404 if the establishment is not found', async () => {
      establishmentRecord.restore = sinon.stub().resolves(false);

      setupTests();
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
      expect(establishmentRecord.load).not.to.have.been.called;
      expect(establishmentRecord.save).not.to.have.been.called;
      expect(res.statusCode).to.equal(404);
    });

    it('should respond with 400 if the establishment failed to load', async () => {
      establishmentRecord.restore = sinon.stub().resolves(true);
      establishmentRecord.load = sinon.stub().resolves(false);

      setupTests();
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
      expect(establishmentRecord.load).to.have.been.called;
      expect(establishmentRecord.save).not.to.have.been.called;
      expect(res.statusCode).to.equal(400);
    });

    it('should respond with 400 if it failed to update', async () => {
      establishmentRecord.restore = sinon.stub().resolves(false);

      setupTests();
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
      expect(establishmentRecord.load).not.to.have.been.called;
      expect(establishmentRecord.save).not.to.have.been.called;
      expect(res.statusCode).to.equal(404);
    });

    it('should respond with 500 when there is an unexpected error', async () => {
      establishmentRecord.restore = sinon.stub().throws();

      setupTests();
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
