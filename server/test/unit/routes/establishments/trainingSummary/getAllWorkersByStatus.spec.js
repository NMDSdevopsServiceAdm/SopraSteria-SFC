const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const Training = require('../../../../../models/classes/training').Training;
const { mockExpiredTrainingRecords } = require('../../../mockdata/training');
const {
  getAllTrainingByStatus,
} = require('../../../../../routes/establishments/trainingSummary/getAllWorkersTrainingByStatus');
const models = require('../../../../../models');

describe('server/routes/establishments/trainingSummary/getAllTrainingByStatus.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getAllTrainingByStatus', () => {
    let req;
    let res;

    const returnedWorkers = [
      {
        NameValue: 'Establishment Name',
        workers: [
          {
            NameOrIdValue: 'Person 1',
            expiredTrainingCount: 2,
            id: 34,
            uid: 'mock-uid-1',
          },
          {
            NameOrIdValue: 'Person 2',
            expiredTrainingCount: 1,
            id: 45,
            uid: 'mock-uid-2',
          },
          {
            NameOrIdValue: 'Person 3',
            expiredTrainingCount: 1,
            id: 79,
            uid: 'mock-uid-3',
          },
        ],
      },
    ];
    beforeEach(() => {
      const request = {
        method: 'GET',
        url: '/api/establishment/mocked-uid/trainingAndQualifications/expired',
        params: { status: 'expired' },
        establishmentId: 6,
        query: { itemsPerPage: '15', pageIndex: '0', sortBy: 'staffNameAsc', searchTerm: '' },
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    it('should return a status of 200 when retrieving expired or expiring training', async () => {
      sinon
        .stub(models.establishment, 'getWorkerWithExpiredOrExpiringTraining')
        .returns({ rows: returnedWorkers, count: 3 });
      sinon.stub(Training, 'getWorkersTrainingByStatus').returns(mockExpiredTrainingRecords);

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({ workers: mockExpiredTrainingRecords, workerCount: 3 });
    });

    it('should return a status of 200 and an empty array if there are no results', async () => {
      sinon.stub(models.establishment, 'getWorkerWithExpiredOrExpiringTraining').returns({ rows: [], count: 0 });

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({ workers: [], workerCount: 0 });
    });

    it('should return a status of 400 and error message if there is no establishment id', async () => {
      req.establishmentId = null;

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal('The establishment id and status must be given');
    });

    it('should return a status of 400 and error message if there is no status', async () => {
      req.params = { status: null };

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal('The establishment id and status must be given');
    });

    it('should return a status of 500 when an error is thrown on getWorkerWithExpiredOrExpiringTraining', async () => {
      sinon.stub(models.establishment, 'getWorkerWithExpiredOrExpiringTraining').throws(new Error());

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(500);
      expect(res._getData()).to.deep.equal('Failed to get expired training and qualifications for establishment 6');
    });

    it('should return a status of 500 when an error is thrown on getWorkersTrainingByStatus', async () => {
      sinon
        .stub(models.establishment, 'getWorkerWithExpiredOrExpiringTraining')
        .returns({ rows: returnedWorkers, count: 3 });
      sinon.stub(Training, 'getWorkersTrainingByStatus').throws(new Error());

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(500);
      expect(res._getData()).to.deep.equal('Failed to get expired training and qualifications for establishment 6');
    });
  });
});
