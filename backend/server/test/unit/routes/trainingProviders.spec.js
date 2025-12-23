const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');

const { getAllTrainingProviders } = require('../../../routes/trainingProviders');

describe('/trainingProviders', () => {
  describe('getAllTrainingProviders', () => {
    const mockRequest = {
      method: 'GET',
      url: '/api/trainingProviders',
    };

    const mockTrainingProviders = [
      { id: 1, name: 'Care skill academy', isOther: false },
      { id: 63, name: 'other', isOther: true },
    ];

    afterEach(() => {
      sinon.restore();
    });

    it('should respond with 200 and a list of training providers when successful', async () => {
      sinon.stub(models.trainingProvider, 'findAll').resolves(mockTrainingProviders);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllTrainingProviders(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal({ trainingProviders: mockTrainingProviders });
    });

    it('should respond with 500 error if error thrown', async () => {
      sinon.stub(models.trainingProvider, 'findAll').rejects(new Error('Database error'));
      sinon.stub(console, 'error'); // suppress error messages in test logs

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllTrainingProviders(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
