const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../models');
const {
  getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer,
  getWorkersWhoRequireCareWorkforcePathwayRoleAnswer,
} = require('../../../../routes/establishments/careWorkforcePathway');

describe('careWorkforcePathwayRole', () => {
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

  describe('getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer', () => {
    const establishmentId = 'some-uuid';

    const request = {
      method: 'GET',
      url: `/api/establishment/${establishmentId}/getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer`,
      params: {
        establishmentId,
      },
      establishmentId,
    };

    it('should return the number when there are workers with care workforce pathway category unanswered', async () => {
      sinon.stub(models.worker, 'countAllWorkersWithoutCareWorkforceCategory').returns(workersFromDB.length);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal({ noOfWorkersWhoRequireAnswers: workersFromDB.length });
    });

    it('should return 0 when there are no workers with care workforce pathway category unanswered', async () => {
      sinon.stub(models.worker, 'countAllWorkersWithoutCareWorkforceCategory').returns(0);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal({ noOfWorkersWhoRequireAnswers: 0 });
    });

    it('should return an error', async () => {
      sinon.stub(models.worker, 'countAllWorkersWithoutCareWorkforceCategory').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('GET /workersWhoRequireCareWorkforcePathwayRoleAnswer', () => {
    afterEach(() => {
      sinon.restore();
    });

    const establishmentId = 'mock-workplace-uuid';

    const request = {
      method: 'GET',
      url: `/api/establishment/${establishmentId}/workersWhoRequireCareWorkforcePathwayRoleAnswer`,
      params: {
        id: establishmentId,
      },
      establishmentId,
    };

    it('should respond with 200 and a list of workers who have their care workforce pathway role category unanswered', async () => {
      sinon
        .stub(models.worker, 'getAndCountAllWorkersWithoutCareWorkforceCategory')
        .returns({ workers: workersFromDB, count: workersFromDB.length });

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

      const expectedResponseBody = {
        workers: workersFromDB,
        workerCount: workersFromDB.length,
      };

      expect(res.statusCode).to.deep.equal(200);

      expect(res._getData()).to.deep.equal(expectedResponseBody);
    });

    it('should respond with 200 and an empty array and workerCount = 0 if no worker has got the question unanswered', async () => {
      sinon.stub(models.worker, 'getAndCountAllWorkersWithoutCareWorkforceCategory').returns({ workers: [], count: 0 });

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

      const expectedResponseBody = {
        workers: [],
        workerCount: 0,
      };

      expect(res.statusCode).to.deep.equal(200);

      expect(res._getData()).to.deep.equal(expectedResponseBody);
    });

    it('should respond with 500 error if something went wrong during database query', async () => {
      sinon.stub(models.worker, 'getAndCountAllWorkersWithoutCareWorkforceCategory').throws();
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

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
          url: `/api/establishment/${establishmentId}/workersWhoRequireCareWorkforcePathwayRoleAnswer`,
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
        sinon.stub(models.worker, 'getAndCountAllWorkersWithoutCareWorkforceCategory').callsFake(mockDbOperation);
      });

      it('should call database with the itemsPerPage and pageIndex in request query', async () => {
        const req = createRequestWithQuery({ itemsPerPage: 10, pageIndex: 3 });
        const res = httpMocks.createResponse();
        await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

        expect(res.statusCode).to.deep.equal(200);

        expect(models.worker.getAndCountAllWorkersWithoutCareWorkforceCategory).to.have.been.calledWith({
          establishmentId: 'mock-workplace-uuid',
          itemsPerPage: 10,
          pageIndex: 3,
        });
      });

      it('should call database with itemsPerPage = 15 and pageIndex = 0 if no query was given', async () => {
        const req = createRequestWithQuery({});
        const res = httpMocks.createResponse();
        await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

        expect(res.statusCode).to.deep.equal(200);

        expect(models.worker.getAndCountAllWorkersWithoutCareWorkforceCategory).to.have.been.calledWith({
          establishmentId: 'mock-workplace-uuid',
          itemsPerPage: 15,
          pageIndex: 0,
        });
      });
    });
  });
});
