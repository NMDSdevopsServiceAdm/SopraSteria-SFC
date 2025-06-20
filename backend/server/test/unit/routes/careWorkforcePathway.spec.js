const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');
const { getAllCareWorkforcePathwayUseReasons } = require('../../../routes/careWorkforcePathway');
const { MockCareWorkforcePathwayUseReasons } = require('../mockdata/careWorkforcePathway');

describe('/careWorkforcePathway', () => {
  describe('getAllCareWorkforcePathwayUseReasons', () => {
    const mockRequest = {
      method: 'GET',
      url: '/api/careWorkforcePathway/useReasons',
    };

    const mockReasons = MockCareWorkforcePathwayUseReasons;

    afterEach(() => {
      sinon.restore();
    });

    it('should respond with 200 and a list of all Care Workforce Pathway use reasons', async () => {
      sinon.stub(models.CareWorkforcePathwayReasons, 'findAll').resolves(mockReasons);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllCareWorkforcePathwayUseReasons(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal({ allReasons: mockReasons });
    });

    it('should respond with 500 error if failed to retrieve the list of reasons', async () => {
      sinon.stub(models.CareWorkforcePathwayReasons, 'findAll').rejects(new Error('some database error'));
      sinon.stub(console, 'error'); // suppress distracting error msg in test log

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllCareWorkforcePathwayUseReasons(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
