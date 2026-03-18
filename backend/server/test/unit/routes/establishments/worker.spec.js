const expect = require('chai').expect;
const sinon = require('sinon');
const { build, fake, sequence, oneOf } = require('@jackfranklin/test-data-bot');
const httpMocks = require('node-mocks-http');
const moment = require('moment');

const models = require('../../../../models/index');
const workerRoute = require('../../../../routes/establishments/worker');
const WdfCalculator = require('../../../../models/classes/wdfCalculator').WdfCalculator;

let i = 0;
const worker = {
  establishmentId: 1,
  workerId: '29155c11-11bb-4ab3-ada0-bccac7acecc1',
  id: 1,
  i,
};
const establishment = {
  establishmentId: 2,
};

describe('worker route', () => {
  before(() => {
    sinon.stub(models.worker, 'findOne').callsFake(async (args) => {
      return args.i === 3 ? {} : worker;
    });
    sinon.stub(models.worker, 'create').callsFake(async () => {
      return worker;
    });
    sinon.stub(models.worker, 'update').callsFake(async () => {
      const mockWorker = {
        get: () => {
          return worker;
        },
      };
      return [1, [mockWorker]];
    });
    sinon.stub(models.workerAudit, 'bulkCreate').callsFake(async () => {
      return {};
    });
    sinon.stub(models.establishment, 'findOne').callsFake(async () => {
      return establishment;
    });
  });

  after(() => {
    sinon.restore();
  });

  describe.skip('editWorker()', () => {
    it('should return worker changes', async () => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
      };
      const updateJson = (json) => {
        expect(typeof json).to.deep.equal('object');
        expect(json.uid).to.deep.equal(worker.workerId);
        expect(json.establishmentFk).to.deep.equal(worker.establishmentId);
      };
      await workerRoute.editWorker(
        {
          establishmentId: establishment.establishmentId,
          username: 'test123',
          params: {
            workerId: worker.workerId,
          },
          body: {
            establishmentId: worker.establishmentId,
          },
          headers: {
            'x-override-put-return-all': false,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
      );
    });
    it('should return an error when the worker id is not valid', async () => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(400);
      };
      const updateJson = (json) => {
        expect(json).to.deep.equal('Unexpected worker id');
      };
      await workerRoute.editWorker(
        {
          establishmentId: establishment.establishmentId,
          username: 'test123',
          params: {
            workerId: worker.workerId + 1,
          },
          body: {
            establishmentId: worker.establishmentId,
          },
          headers: {
            'x-override-put-return-all': false,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
      );
    });
    it('should return an error when the worker is not valid', async () => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(400);
      };
      const updateJson = (json) => {
        expect(json).to.deep.equal('Unexpected Input.');
      };
      await workerRoute.editWorker(
        {
          establishmentId: establishment.establishmentId,
          username: 'test123',
          params: {
            workerId: worker.workerId,
          },
          body: {
            otherJobs: false,
          },
          headers: {
            'x-override-put-return-all': false,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
      );
    });
    it('should return an error when the worker is not found', async () => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(404);
      };
      const updateJson = (json) => {
        expect(json).to.deep.equal('Unexpected Input.');
      };
      await workerRoute.editWorker(
        {
          establishmentId: establishment.establishmentId,
          username: 'test123',
          params: {
            workerId: worker.workerId,
          },
          headers: {
            'x-override-put-return-all': false,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
      );
    });
  });

  describe('viewAllWorkers()', () => {
    const workerBuilder = build('Worker', {
      fields: {
        uid: fake((f) => f.datatype.uuid()),
        LocalIdentifierValue: fake((f) => f.datatype.uuid()),
        NameOrIdValue: fake((f) => f.name.findName()),
        ContractValue: 'Permenant',
        mainJob: {
          id: sequence(),
          title: fake((f) => f.name.jobTitle()),
          get: () => fake((f) => f.name.jobTitle()),
        },
        CompletedValue: true,
        created: fake((f) => f.date.past(1).toISOString()),
        updated: fake((f) => f.date.past(1).toISOString()),
        updatedBy: fake((f) => f.internet.userName()),
        lastWdfEligibility: fake((f) => f.date.past(1)),
        get: () => String(Math.floor(Math.random() * 11)),
      },
    });

    const worker = workerBuilder();
    let workersAndTrainingStub;

    beforeEach(() => {
      workersAndTrainingStub = sinon.stub(models.establishment, 'workersAndTraining').returns({
        rows: [{ workers: [worker] }],
        count: 1,
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a list of workers', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/establishment/123/worker',
      });

      req.username = 'aylingw';
      req.userUid = '1234';
      req.establishment = {
        id: 123,
      };
      req.establishmentId = 123;

      const res = httpMocks.createResponse();
      await workerRoute.viewAllWorkers(req, res);

      const effectiveFrom = WdfCalculator.effectiveDate.toISOString();

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData().workers[0]).to.contains({
        uid: worker.uid,
        localIdentifier: worker.LocalIdentifierValue,
        nameOrId: worker.NameOrIdValue,
        contract: worker.ContractValue,
        completed: worker.CompletedValue,
        updated: worker.updated,
        updatedBy: worker.updatedBy,
        effectiveFrom: effectiveFrom,
        wdfEligible: worker.wdfEligible && moment(worker.lastWdfEligibility).isAfter(effectiveFrom),
        wdfEligibilityLastUpdated: worker.lastWdfEligibility.toISOString(),
      });
      expect(res._getData().workers[0].mainJob).to.contains({
        jobId: worker.mainJob.id,
        title: worker.mainJob.title,
      });
      expect(typeof res._getData().workers[0].trainingCount).to.equal('number');
      expect(typeof res._getData().workers[0].qualificationCount).to.equal('number');
      expect(typeof res._getData().workers[0].expiredTrainingCount).to.equal('number');
      expect(typeof res._getData().workers[0].expiringTrainingCount).to.equal('number');
      expect(typeof res._getData().workers[0].missingMandatoryTrainingCount).to.equal('number');
      expect(res._getData().workerCount).to.equal(1);
    });

    it('should call workersAndTraining with pagination and sort parameters if passed', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/establishment/123/worker',
        query: {
          pageIndex: 1,
          itemsPerPage: 200,
          sortBy: 'someSort',
        },
      });

      req.username = 'aylingw';
      req.userUid = '1234';
      req.establishment = {
        id: 123,
      };
      req.establishmentId = 123;

      const res = httpMocks.createResponse();
      await workerRoute.viewAllWorkers(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(workersAndTrainingStub.args[0]).to.deep.equal([123, false, false, 200, 1, 'someSort', undefined]);
    });

    it('should accept a searchTerm from the request for the where clause', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/establishment/123/worker',
        query: {
          searchTerm: 'worker123',
        },
      });

      req.username = 'anyone';
      req.userUid = '1234';
      req.establishmentId = 123;
      req.establishment = {
        id: 123,
      };

      const res = httpMocks.createResponse();
      await workerRoute.viewAllWorkers(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(workersAndTrainingStub.args[0]).to.deep.equal([
        123,
        false,
        false,
        undefined,
        undefined,
        undefined,
        'worker123',
      ]);
    });

    it('returns the worker count as zero and an empty workers array if no workers are found', async () => {
      workersAndTrainingStub.returns({
        rows: [],
        count: 0,
      });
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/establishment/123/worker',
        query: {
          searchTerm: 'worker123',
        },
      });

      req.username = 'anyone';
      req.userUid = '1234';
      req.establishmentId = 123;
      req.establishment = {
        id: 123,
      };

      const res = httpMocks.createResponse();
      await workerRoute.viewAllWorkers(req, res);

      expect(res._getData().workers).to.deep.equal([]);
      expect(res._getData().workerCount).to.equal(0);
    });
  });

  describe('getAllWorkersGroupedByJobRole()', () => {
    const jobRoles = [
      { id: 10, title: 'Care worker' },
      { id: 22, title: 'Registered manager' },
      { id: 25, title: 'Senior care worker' },
    ];
    const mockWorkers = [
      {
        uid: 'uid-0',
        mainJob: jobRoles[2],
      },
      {
        uid: 'uid-1',
        mainJob: jobRoles[1],
      },
      {
        uid: 'uid-2',
        mainJob: jobRoles[0],
      },
      {
        uid: 'uid-3',
        mainJob: jobRoles[1],
      },
      {
        uid: 'uid-4',
        mainJob: jobRoles[2],
      },
      {
        uid: 'uid-5',
        mainJob: jobRoles[2],
      },
    ];

    afterEach(() => {
      sinon.restore();
    });

    const request = {
      method: 'GET',
      url: '/api/establishment/uid/worker/total',
      params: {
        establishmentId: '123',
      },
    };

    it('should respond with 200 and all workers in the workplace, grouped by their job roles', async () => {
      sinon.stub(models.worker, 'findAll').resolves(mockWorkers);
      const expectedResponse = {
        groups: [
          { jobId: 10, title: 'Care worker', count: 1, workers: [mockWorkers[2]] },
          { jobId: 22, title: 'Registered manager', count: 2, workers: [mockWorkers[1], mockWorkers[3]] },
          {
            jobId: 25,
            title: 'Senior care worker',
            count: 3,
            workers: [mockWorkers[0], mockWorkers[4], mockWorkers[5]],
          },
        ],
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await workerRoute.getAllWorkersGroupedByJobRole(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal(expectedResponse);
    });

    it('should respond with 200 and an empty array if no workers were found', async () => {
      sinon.stub(models.worker, 'findAll').resolves([]);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await workerRoute.getAllWorkersGroupedByJobRole(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({ groups: [] });
    });

    it('should respond with 500 if error occured', async () => {
      sinon.stub(models.worker, 'findAll').rejects(new Error('some database error'));
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await workerRoute.getAllWorkersGroupedByJobRole(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('getTotalWorkers()', () => {
    const workerBuilder = build('Worker', {
      fields: {
        uid: fake((f) => f.datatype.uuid()),
      },
    });

    const worker = workerBuilder();
    beforeEach(() => {
      sinon.stub(models.establishment, 'workers').returns({
        id: 123,
        workers: [worker],
      });
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should return a total number of staff', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/establishment/123/worker/total',
        params: {
          establishmentId: 123,
        },
      });

      req.username = 'aylingw';
      req.userUid = '1234';
      req.establishment = {
        id: 123,
      };

      const res = httpMocks.createResponse();
      await workerRoute.getTotalWorkers(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({
        total: 1,
      });
    });
  });
});
