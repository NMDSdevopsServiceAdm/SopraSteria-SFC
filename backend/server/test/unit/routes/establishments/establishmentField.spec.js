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

    it('should return with 404 if the requested property to update is not on the allowed list', async () => {
      setupTests('Capacity');
      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).not.to.have.been.called;
      expect(res.statusCode).to.equal(404);
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
