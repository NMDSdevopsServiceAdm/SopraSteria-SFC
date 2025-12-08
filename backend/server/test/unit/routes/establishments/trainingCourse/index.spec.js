const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const sequelize = require('sequelize');
const lodash = require('lodash');

const models = require('../../../../../models');
const {
  fetchAllTrainingCourses,
  createTrainingCourse,
  getTrainingCourse,
  updateTrainingCourse,
  getTrainingCoursesWithLinkableRecords,
} = require('../../../../../routes/establishments/trainingCourse/controllers');
const {
  mockTrainingCourses,
  expectedTrainingCoursesInResponse,
  mockTrainingCourseFindAllResult,
  mockEstablishmentObject,
  trainingCourseWithLinkableRecords,
} = require('../../../mockdata/trainingCourse');
const { NotFoundError } = require('../../../../../utils/errors/customErrors');

describe('/api/establishment/:uid/trainingCourse/', () => {
  afterEach(() => {
    sinon.restore();
  });
  const establishmentUid = 'mock-uid';
  const establishmentId = 'mock-id';
  const mockUsername = 'workplace edit user';
  const baseEndpoint = `/api/establishment/${establishmentUid}/trainingCourse`;
  const mockTrainingCourseUid = mockTrainingCourses[0].uid;

  describe('GET /trainingCourse/ - fetchAllTrainingCourses', () => {
    const request = {
      method: 'GET',
      url: baseEndpoint,
      establishmentId,
      username: mockUsername,
    };

    it('should respond with 200 and a list of all training courses', async () => {
      sinon.stub(models.trainingCourse, 'findAll').resolves(mockTrainingCourseFindAllResult);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: expectedTrainingCoursesInResponse });

      expect(models.trainingCourse.findAll).to.have.been.calledWithMatch({
        where: { establishmentFk: 'mock-id', archived: false },
        attributes: { exclude: ['establishmentFk'] },
        order: [['updated', 'DESC']],
      });
    });

    it('should respond with 200 and an empty list if no training courses was found', async () => {
      sinon.stub(models.trainingCourse, 'findAll').resolves([]);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: [] });
    });

    it('should be able to accept a query of categoryId and return the training courses of that category', async () => {
      sinon.stub(models.trainingCourse, 'findAll').resolves(mockTrainingCourseFindAllResult);

      const req = httpMocks.createRequest({ ...request, query: { trainingCategoryId: 1 } });
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: expectedTrainingCoursesInResponse });

      expect(models.trainingCourse.findAll).to.have.been.calledWithMatch({
        where: { establishmentFk: 'mock-id', archived: false, categoryFk: 1 },
        attributes: { exclude: ['establishmentFk'] },
        order: [['updated', 'DESC']],
      });
    });

    it('should respond with 500 if an error occured during operation', async () => {
      sinon.stub(models.trainingCourse, 'findAll').rejects(new sequelize.ConnectionError('some database error'));
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('POST /trainingCourse/ - createTrainingCourse', () => {
    const request = {
      method: 'GET',
      url: baseEndpoint,
      establishmentId,
      username: mockUsername,
      body: {
        trainingCategoryId: 1,
        name: 'Care skills and knowledge',
        accredited: 'Yes',
        deliveredBy: 'In-house staff',
        trainingProviderId: null,
        otherTrainingProviderName: null,
        howWasItDelivered: 'Face to face',
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      },
    };

    it('should respond with 200 and create the training course', async () => {
      sinon.stub(models.trainingCourse, 'create').resolves({ dataValues: mockTrainingCourses[0] });

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await createTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal(expectedTrainingCoursesInResponse[0]);

      expect(models.trainingCourse.create).to.have.been.calledWith({
        establishmentFk: establishmentId,
        categoryFk: 1,
        name: 'Care skills and knowledge',
        accredited: 'Yes',
        deliveredBy: 'In-house staff',
        otherTrainingProviderName: null,
        howWasItDelivered: 'Face to face',
        doesNotExpire: false,
        validityPeriodInMonth: 24,
        createdBy: mockUsername,
        updatedBy: mockUsername,
      });
    });

    it('should respond with 400 if trainingCategoryId is incorrect', async () => {
      sinon.stub(models.trainingCourse, 'create').rejects(new sequelize.ForeignKeyConstraintError());
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest({ request, body: { ...request.body, trainingCategoryId: 99999 } });
      const res = httpMocks.createResponse();

      await createTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal({ message: 'Invalid request' });
    });

    it('should respond with 400 if the request body contains invalid data', async () => {
      sinon.stub(models.trainingCourse, 'create').rejects(new sequelize.ValidationError());
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await createTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal({ message: 'Invalid request' });
    });

    it('should respond with 500 if other error occured', async () => {
      sinon.stub(models.trainingCourse, 'create').rejects(new sequelize.ConnectionError('some database error'));
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await createTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('GET /trainingCourse/:trainingCourseUid - getTrainingCourse', () => {
    const request = {
      method: 'GET',
      url: `${baseEndpoint}/${mockTrainingCourseUid}`,
      establishmentId,
      username: mockUsername,
      params: { trainingCourseUid: mockTrainingCourseUid },
    };

    it('should respond with 200 and the training course data', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockTrainingCourses[0]);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal(expectedTrainingCoursesInResponse[0]);

      expect(models.trainingCourse.findOne).to.have.been.calledWith({
        where: { establishmentFk: 'mock-id', uid: mockTrainingCourseUid, archived: false },
        include: [{ model: models.workerTrainingCategories, as: 'category' }],
        attributes: { exclude: ['establishmentFk'] },
        raw: true,
      });
    });

    it('should respond with 404 if the training course is not found', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(null);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(404);
      expect(res._getData()).to.deep.equal({ message: 'Training course not found' });
    });

    it('should respond with 500 if an error occurred', async () => {
      sinon.stub(models.trainingCourse, 'findOne').rejects(new sequelize.ConnectionError('some database error'));
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('PUT /trainingCourse/:trainingCourseUid - updateTrainingCourse', () => {
    const mockTrainingCourseInRequestBody = {
      trainingCategoryId: 10,
      trainingProviderId: null,
      name: 'Care skills and knowledge',
      accredited: 'Yes',
      deliveredBy: 'In-house staff',
      otherTrainingProviderName: null,
      howWasItDelivered: 'E-learning',
      doesNotExpire: true,
      validityPeriodInMonth: null,
    };

    const mockRequestBody = {
      trainingCourse: mockTrainingCourseInRequestBody,
      applyToExistingRecords: false,
    };

    const expectedUpdateParams = {
      categoryFk: 10,
      trainingProviderFk: null,
      name: 'Care skills and knowledge',
      accredited: 'Yes',
      deliveredBy: 'In-house staff',
      otherTrainingProviderName: null,
      howWasItDelivered: 'E-learning',
      doesNotExpire: true,
      validityPeriodInMonth: null,
    };

    const request = {
      method: 'PUT',
      url: `${baseEndpoint}/${mockTrainingCourseUid}`,
      establishmentId,
      username: mockUsername,
      params: { trainingCourseUid: mockTrainingCourseUid },
      body: mockRequestBody,
    };

    const mockTrainingRecords = [
      { id: 'record-id-1', uid: 'record-uid-1' },
      { id: 'record-id-2', uid: 'record-uid-2' },
      { id: 'record-id-3', uid: 'record-uid-3' },
    ];

    const mockTrainingCourseSequelizeObject = {
      ...mockTrainingCourses[0],
      toJSON() {
        return lodash.omit(this, ['update', 'toJSON']);
      },
      update() {
        return this;
      },
      getWorkerTraining() {
        return mockTrainingRecords;
      },
    };

    const mockTransaction = {};
    beforeEach(() => {
      sinon.stub(models.sequelize, 'transaction').callsFake((dbOperations) => dbOperations(mockTransaction));
    });

    it('should respond with 200 if successfully updated the record', async () => {
      sinon.stub(models.trainingCourse, 'updateTrainingCourse').resolves(mockTrainingCourseSequelizeObject);
      sinon.stub(models.trainingCourse, 'updateTrainingRecordsWithCourseData').resolves();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should update the training course but not its related training record, if applyToExistingRecords is false', async () => {
      sinon.stub(models.trainingCourse, 'updateTrainingCourse').resolves(mockTrainingCourseSequelizeObject);
      sinon.stub(models.trainingCourse, 'updateTrainingRecordsWithCourseData').resolves();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(models.trainingCourse.updateTrainingCourse).to.have.been.calledWith(
        sinon.match({
          establishmentId: 'mock-id',
          trainingCourseUid: mockTrainingCourseUid,
          updates: expectedUpdateParams,
        }),
      );
      expect(models.trainingCourse.updateTrainingRecordsWithCourseData).not.to.have.been.called;
    });

    it('should update the training course AND its related training record, if applyToExistingRecords is true', async () => {
      sinon.stub(models.trainingCourse, 'updateTrainingCourse').resolves(mockTrainingCourseSequelizeObject);
      sinon.stub(models.trainingCourse, 'updateTrainingRecordsWithCourseData').resolves();

      const mockRequest = lodash.cloneDeep(request);
      mockRequest.body.applyToExistingRecords = true;

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();

      await updateTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(models.trainingCourse.updateTrainingCourse).to.have.been.calledWith(
        sinon.match({
          establishmentId: 'mock-id',
          trainingCourseUid: mockTrainingCourseUid,
          updates: expectedUpdateParams,
        }),
      );
      expect(models.trainingCourse.updateTrainingRecordsWithCourseData).to.have.been.calledWith({
        trainingCourseUid: mockTrainingCourseUid,
        trainingRecordUids: mockTrainingRecords.map((record) => record.uid),
        updatedBy: mockUsername,
        transaction: mockTransaction,
      });
    });

    it('should respond with 400 if the req body is empty', async () => {
      sinon.stub(models.trainingCourse, 'updateTrainingCourse').resolves(mockTrainingCourseSequelizeObject);
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest({ ...request, body: undefined });
      const res = httpMocks.createResponse();

      await updateTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(400);

      expect(models.trainingCourse.updateTrainingCourse).not.to.be.called;
    });

    it('should respond with 404 if the course was not found', async () => {
      sinon.stub(models.trainingCourse, 'updateTrainingCourse').rejects(new NotFoundError());
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(404);
    });

    it('should respond with 500 if error occured', async () => {
      sinon.stub(models.trainingCourse, 'updateTrainingCourse').rejects(new Error('some error'));
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('GET /trainingCourse/getTrainingCoursesWithLinkableRecords', () => {
    const request = {
      method: 'GET',
      url: `${baseEndpoint}/getTrainingCoursesWithLinkableRecords`,
      establishmentId,
      username: mockUsername,
    };

    it('should respond with 200 and an empty array if no training course in the workplace', async () => {
      sinon.stub(models.trainingCourse, 'findAll').resolves([]);
      sinon.stub(models.establishment, 'findWithWorkersAndTraining').resolves(mockEstablishmentObject);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCoursesWithLinkableRecords(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: [] });
    });

    it('should respond with 200 and a list of training courses with no linkable training if no worker in the workplace', async () => {
      const establishmentWithNoWorkers = { ...mockEstablishmentObject, workers: [] };

      sinon.stub(models.trainingCourse, 'findAll').resolves(mockTrainingCourseFindAllResult);
      sinon.stub(models.establishment, 'findWithWorkersAndTraining').resolves(establishmentWithNoWorkers);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCoursesWithLinkableRecords(req, res);

      expect(res.statusCode).to.deep.equal(200);

      const trainingCoursesWithNoLinkableRecords = expectedTrainingCoursesInResponse
        .map((course) => ({
          ...course,
          linkableTrainingRecords: [],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      expect(res._getData()).to.deep.equal({ trainingCourses: trainingCoursesWithNoLinkableRecords });
    });

    it('should respond with 200 and a list of training courses with linkable training records', async () => {
      sinon.stub(models.trainingCourse, 'findAll').resolves(mockTrainingCourseFindAllResult);
      sinon.stub(models.establishment, 'findWithWorkersAndTraining').resolves(mockEstablishmentObject);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCoursesWithLinkableRecords(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: trainingCourseWithLinkableRecords });
    });

    it('should respond with 500 if error occured', async () => {
      sinon.stub(models.trainingCourse, 'findAll').resolves(mockTrainingCourseFindAllResult);
      sinon.stub(models.establishment, 'findWithWorkersAndTraining').rejects('some error');
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCoursesWithLinkableRecords(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
