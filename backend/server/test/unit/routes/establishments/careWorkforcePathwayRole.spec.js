const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../models');
const {
  countWorkersWhoRequireCareWorkforcePathwayRoleAnswer,
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
      careWorkforcePathwayRoleCategory: {
        id: 1,
        title: 'New to care',
      },
    },
    {
      uid: 'tsw-1',
      nameOrId: 'Test Worker 1',
      mainJob: { title: 'Registered manager' },
      careWorkforcePathwayRoleCategory: {
        id: 7,
        title: 'Registered manager',
      },
    },
    {
      uid: 'tsw-2',
      nameOrId: 'Test Worker 2',
      mainJob: { title: 'Support worker' },
      careWorkforcePathwayRoleCategory: null,
    },
  ];

  describe('countWorkersWhoRequireCareWorkforcePathwayRoleAnswer', () => {
    const establishmentId = 'some-uuid';

    const request = {
      method: 'GET',
      url: `/api/establishment/${establishmentId}/countWorkersWhoRequireCareWorkforcePathwayRoleAnswer`,
      params: {
        establishmentId,
      },
      establishmentId,
    };

    it('should return the number when there are workers who should see care workforce pathway worker questions', async () => {
      sinon.stub(models.worker, 'countAllWorkersForCareWorkforcePathwayRoleCategory').resolves(workersFromDB.length);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await countWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal({ workerCount: workersFromDB.length });
    });

    it('should return 0 when there are no workers with care workforce pathway category unanswered', async () => {
      sinon.stub(models.worker, 'countAllWorkersForCareWorkforcePathwayRoleCategory').resolves(0);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await countWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal({ workerCount: 0 });
    });

    it('should return an error if something went wrong during database query', async () => {
      sinon
        .stub(models.worker, 'countAllWorkersForCareWorkforcePathwayRoleCategory')
        .rejects(new Error('some database error'));
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await countWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

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

    it('should respond with 200 and a list of workers whose job role can have CWP role category', async () => {
      sinon
        .stub(models.worker, 'getAndCountAllWorkersForCareWorkforcePathwayRoleCategory')
        .resolves({ workers: workersFromDB, count: workersFromDB.length });

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

    it('should respond with 200 and an empty array and workerCount = 0 if no worker meet the condition', async () => {
      sinon
        .stub(models.worker, 'getAndCountAllWorkersForCareWorkforcePathwayRoleCategory')
        .resolves({ workers: [], count: 0 });

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
      sinon
        .stub(models.worker, 'getAndCountAllWorkersForCareWorkforcePathwayRoleCategory')
        .rejects(new Error('some database error'));
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();
      await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    describe('pagination and sorting', () => {
      const mockWorkers = Array(100)
        .fill(null)
        .map((_, index) => ({
          uid: `worker-uid-${index + 1}`,
          nameOrId: `worker ${index + 1}`,
          mainJob: { title: 'Care worker' },
          careWorkforcePathwayRoleCategory: null,
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
        sinon
          .stub(models.worker, 'getAndCountAllWorkersForCareWorkforcePathwayRoleCategory')
          .callsFake(mockDbOperation);
      });

      it('should call database with the itemsPerPage, pageIndex and sortBy in request query', async () => {
        const req = createRequestWithQuery({ itemsPerPage: 10, pageIndex: 3, sortBy: 'staffNameDesc' });
        const res = httpMocks.createResponse();
        await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

        expect(res.statusCode).to.deep.equal(200);

        expect(models.worker.getAndCountAllWorkersForCareWorkforcePathwayRoleCategory).to.have.been.calledWith({
          establishmentId: 'mock-workplace-uuid',
          itemsPerPage: 10,
          pageIndex: 3,
          sortBy: 'staffNameDesc',
        });
      });

      it('should call database with itemsPerPage = 15, pageIndex = 0, sortBy = "staffNameAsc" if no query was given', async () => {
        const req = createRequestWithQuery({});
        const res = httpMocks.createResponse();

        await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

        expect(res.statusCode).to.deep.equal(200);

        expect(models.worker.getAndCountAllWorkersForCareWorkforcePathwayRoleCategory).to.have.been.calledWith({
          establishmentId: 'mock-workplace-uuid',
          itemsPerPage: 15,
          pageIndex: 0,
          sortBy: 'staffNameAsc',
        });
      });

      it('should call with sortBy = "staffNameAsc" if the given sortBy value is not recognised', async () => {
        const req = createRequestWithQuery({ sortBy: 'someInvalidSortBy' });
        const res = httpMocks.createResponse();

        await getWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

        expect(res.statusCode).to.deep.equal(200);

        expect(models.worker.getAndCountAllWorkersForCareWorkforcePathwayRoleCategory).to.have.been.calledWith({
          establishmentId: 'mock-workplace-uuid',
          itemsPerPage: 15,
          pageIndex: 0,
          sortBy: 'staffNameAsc',
        });
      });
    });
  });
});
