const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../models');
const {
  getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer,
  getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer,
} = require('../../../../routes/establishments/delegatedHealthcareActivities');

describe('delegatedHealthcareActitity', () => {
  afterEach(() => {
    sinon.restore();
  });

  const workersFromDB = [
    {
      uid: 'tsw-0',
      nameOrId: 'Test Worker 0',
      mainJob: { title: 'Care worker' },
    },
    {
      uid: 'tsw-1',
      nameOrId: 'Test Worker 1',
      mainJob: { title: 'Registered manager' },
    },
    {
      uid: 'tsw-2',
      nameOrId: 'Test Worker 2',
      mainJob: { title: 'Support worker' },
    },
  ];

  describe('getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer', () => {
    const establishmentId = 'some-uuid';

    const request = {
      method: 'GET',
      url: `/api/establishment/${establishmentId}/noOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer`,
      params: {
        establishmentId,
      },
      establishmentId,
    };

    it('should return the number when there are workers with delegated healthcare unanswered', async () => {
      sinon.stub(models.worker, 'countAllWorkersWithoutDelegatedHealthCareActivities').returns(workersFromDB.length);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal({ noOfWorkersWhoRequiresAnswer: workersFromDB.length });
    });

    it('should return 0 when there are no workers with delegated healthcare activity unanswered', async () => {
      sinon.stub(models.worker, 'countAllWorkersWithoutDelegatedHealthCareActivities').returns(0);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal({ noOfWorkersWhoRequiresAnswer: 0 });
    });

    it('should return an error', async () => {
      sinon.stub(models.worker, 'countAllWorkersWithoutDelegatedHealthCareActivities').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('GET /workersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer', () => {
    afterEach(() => {
      sinon.restore();
    });

    const establishmentId = 'mock-workplace-uuid';

    const request = {
      method: 'GET',
      url: `/api/establishment/${establishmentId}/workersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer`,
      params: {
        id: establishmentId,
      },
      establishmentId,
    };

    it('should respond with 200 and a list of workers who have their delegated healthcare activities unanswered', async () => {
      sinon
        .stub(models.worker, 'getAndCountAllWorkersWithoutDelegatedHealthCareActivities')
        .returns({ workers: workersFromDB, count: workersFromDB.length });

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(req, res);

      const expectedResponseBody = {
        workers: workersFromDB,
        workerCount: workersFromDB.length,
      };

      expect(res.statusCode).to.deep.equal(200);

      expect(res._getData()).to.deep.equal(expectedResponseBody);
    });

    it('should respond with 200 and an empty array and workerCount = 0 if no worker has got the question unanswered', async () => {
      sinon
        .stub(models.worker, 'getAndCountAllWorkersWithoutDelegatedHealthCareActivities')
        .returns({ workers: [], count: 0 });

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(req, res);

      const expectedResponseBody = {
        workers: [],
        workerCount: 0,
      };

      expect(res.statusCode).to.deep.equal(200);

      expect(res._getData()).to.deep.equal(expectedResponseBody);
    });

    it('should respond with 500 error if something went wrong during database query', async () => {
      sinon.stub(models.worker, 'getAndCountAllWorkersWithoutDelegatedHealthCareActivities').throws();
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    describe('pagination', () => {
      const mockWorkers = Array(100)
        .fill(null)
        .map((_, index) => ({
          uid: `worker-uid-${index + 1}`,
          nameOrId: `worker ${index + 1}`,
          mainJob: { title: 'Care worker' },
        }));

      const createRequestWithQuery = (query = {}) => {
        const request = {
          method: 'GET',
          url: `/api/establishment/${establishmentId}/workersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer`,
          params: {
            id: establishmentId,
          },
          query,
          establishmentId,
        };

        return httpMocks.createRequest(request);
      };

      beforeEach(() => {
        const mockDbOperation = ({ itemsPerPage, pageIndex }) => {
          return {
            count: mockWorkers.length,
            workers: mockWorkers.slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage),
          };
        };
        sinon
          .stub(models.worker, 'getAndCountAllWorkersWithoutDelegatedHealthCareActivities')
          .callsFake(mockDbOperation);
      });

      it('should call database with the itemsPerPage and pageIndex in request query', async () => {
        const req = createRequestWithQuery({ itemsPerPage: 10, pageIndex: 3 });
        const res = httpMocks.createResponse();
        await getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(req, res);

        expect(res.statusCode).to.deep.equal(200);

        expect(models.worker.getAndCountAllWorkersWithoutDelegatedHealthCareActivities).to.have.been.calledWith({
          establishmentId: 'mock-workplace-uuid',
          itemsPerPage: 10,
          pageIndex: 3,
        });
      });

      it('should call database with itemsPerPage = 15 and pageIndex = 0 if no query was given', async () => {
        const req = createRequestWithQuery({});
        const res = httpMocks.createResponse();
        await getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(req, res);

        expect(res.statusCode).to.deep.equal(200);

        expect(models.worker.getAndCountAllWorkersWithoutDelegatedHealthCareActivities).to.have.been.calledWith({
          establishmentId: 'mock-workplace-uuid',
          itemsPerPage: 15,
          pageIndex: 0,
        });
      });
    });
  });
});
