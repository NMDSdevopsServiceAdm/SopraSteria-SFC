const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');
const { getAllDelegatedHealthcareActivities } = require('../../../routes/delegatedHealthcareActivities');

describe('/delegatedHealthcareActivities', () => {
  describe('getAllDelegatedHealthcareActivities', () => {
    const mockRequest = {
      method: 'GET',
      url: '/api/delegatedHealthcareActivities',
    };

    const mockDHAs = [
      {
        id: 1,
        title: 'Vital signs monitoring',
        description: 'Like monitoring heart rate as part of the treatment of a condition.',
      },
      {
        id: 2,
        title: 'Specialised medication administration',
        description: 'Like administering warfarin.',
      },
    ];

    afterEach(() => {
      sinon.restore();
    });

    it('should respond with 200 and a list of DHAs when successful', async () => {
      sinon.stub(models.delegatedHealthcareActivities, 'findAll').resolves(mockDHAs);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllDelegatedHealthcareActivities(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal({ allDHAs: mockDHAs });
    });

    it('should respond with 500 error if error thrown', async () => {
      sinon.stub(models.delegatedHealthcareActivities, 'findAll').rejects(new Error('Database error'));
      sinon.stub(console, 'error'); // suppress error messages in test logs

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await getAllDelegatedHealthcareActivities(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
