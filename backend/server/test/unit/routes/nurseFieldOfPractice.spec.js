const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');
const { getAllNurseFieldsOfPractice } = require('../../../routes/nurseFieldOfPractice');
const { MockNurseFieldsOfPractice } = require('../mockdata/nurseFieldOfPractice');

describe('/nurseFieldOfPractice', () => {
  describe('getAllNurseFieldsOfPractice', () => {
    const mockRequest = {
      method: 'GET',
      url: '/api/nurseFieldOfPractice',
    };

    const mockFields = MockNurseFieldsOfPractice;

    afterEach(() => {
      sinon.restore();
    });

    it('should respond with 200 and a list of nurse fields of practice when successful', async () => {
      sinon.stub(models.nurseFieldOfPractice, 'findAll').resolves(mockFields);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllNurseFieldsOfPractice(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal({ allNurseFieldsOfPractice: mockFields });
    });

    it('should respond with 500 error if error thrown', async () => {
      sinon.stub(models.nurseFieldOfPractice, 'findAll').rejects(new Error('Database connection failed'));

      // Suppress error messages in test logs to keep output clean
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllNurseFieldsOfPractice(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
