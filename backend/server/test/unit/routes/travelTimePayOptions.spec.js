const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');
const { getAllTravelTimePayOptions } = require('../../../routes/travelTimePayOptions');

describe('/travelTimePayOptions', () => {
  describe('getAllTravelTimePayOptions', () => {
    const mockRequest = {
      method: 'GET',
      url: '/api/travelTimePayOptions',
    };

    const mockData = [
      {
        id: 1,
        label: 'The same rate for travel time as for visits',
        includeRate: false,
      },
      {
        id: 2,
        label: 'Minimum wage',
        includeRate: false,
      },
      {
        id: 3,
        label: 'A different travel time rate',
        includeRate: true,
      },
    ];

    afterEach(() => {
      sinon.restore();
    });

    it('should respond with 200 and a list of all travelTimePayOptions when successful', async () => {
      sinon.stub(models.travelTimePayOption, 'findAll').resolves(mockData);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllTravelTimePayOptions(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal({ travelTimePayOptions: mockData });
    });

    it('should respond with 500 error if error thrown', async () => {
      sinon.stub(models.travelTimePayOption, 'findAll').rejects(new Error('Database error'));
      sinon.stub(console, 'error'); // suppress error messages in test logs

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllTravelTimePayOptions(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
