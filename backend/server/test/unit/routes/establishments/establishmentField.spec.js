const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Establishment = require('../../../../models/classes/establishment');
const {
  getEstablishmentField,
  updateEstablishmentFieldWithAudit,
} = require('../../../../routes/establishments/establishmentField');

describe('server/routes/establishments/getEstablishmentField', () => {
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

  describe('/getEstablishmentField', () => {
    const mockRequest = {
      method: 'GET',
      url: `/api/establishment/${establishmentId}/getEstablishmentField/${property}`,
      establishmentId: establishmentId,
      username: 'user',
    };

    it('should respond with 200 and return the value on the requested property', async () => {
      establishmentRecord.restore = sinon.stub().resolves(true);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await getEstablishmentField(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId, false);
      expect(res.statusCode).to.equal(200);
    });

    it('should respond with 404 if the establishment is not found', async () => {
      establishmentRecord.restore = sinon.stub().resolves(false);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await getEstablishmentField(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId, false);
      expect(res.statusCode).to.equal(404);
    });

    it('should respond with 500 when there is an unexpected error', async () => {
      establishmentRecord.restore = sinon.stub().throws();

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await getEstablishmentField(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });

  describe('/updateEstablishmentFieldWithAudit', () => {
    const mockRequest = {
      method: 'POST',
      url: `/api/establishment/${establishmentId}/updateEstablishmentFieldWithAudit/${property}`,
      establishmentId: establishmentId,
      username: 'user',
      body: { employerType: { value: 'Private Sector' } },
    };

    it('should update the property and return a 200 status', async () => {
      establishmentRecord.restore = sinon.stub().resolves(true);
      establishmentRecord.load = sinon.stub().resolves(true);
      establishmentRecord.save = sinon.stub().resolves(true);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(establishmentRecord.restore).to.have.been.calledWith(establishmentId);
      expect(establishmentRecord.load).to.have.been.calledWith(req.body);
      expect(establishmentRecord.save).to.have.been.called;
      expect(res.statusCode).to.equal(200);
    });

    it('should respond with 404 if the establishment is not found', async () => {
      establishmentRecord.restore = sinon.stub().resolves(false);

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

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      await updateEstablishmentFieldWithAudit(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});

