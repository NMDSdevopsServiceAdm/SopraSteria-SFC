const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const sequelize = require('sequelize');

const models = require('../../../../../models');
const {
  fetchAllTrainingCourses,
  createTrainingCourse,
  getTrainingCourse,
} = require('../../../../../routes/establishments/trainingCourse/controllers');
const { mockTrainingCourses, expectedTrainingCoursesInResponse } = require('../../../mockdata/trainingCourse');

describe('/api/establishment/:uid/trainingCourse/', () => {
  afterEach(() => {
    sinon.restore();
  });
  const establishmentUid = 'mock-uid';
  const establishmentId = 'mock-id';
  const mockUsername = 'workplace edit user';
  const baseEndpoint = `/api/establishment/${establishmentUid}/trainingCourse`;

  describe('GET /trainingCourse/ - fetchAllTrainingCourses', () => {
    const request = {
      method: 'GET',
      url: baseEndpoint,
      establishmentId,
      username: mockUsername,
    };

    it('should respond with 200 and a list of all training courses', async () => {
      sinon.stub(models.trainingCourse, 'findAll').resolves(mockTrainingCourses);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: expectedTrainingCoursesInResponse });

      expect(models.trainingCourse.findAll).to.have.been.calledWith({
        where: {
          establishmentFk: establishmentId,
          archived: false,
        },
        raw: true,
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
      sinon.stub(models.trainingCourse, 'findAll').resolves(mockTrainingCourses);

      const req = httpMocks.createRequest({ ...request, query: { trainingCategoryId: 1 } });
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: expectedTrainingCoursesInResponse });

      expect(models.trainingCourse.findAll).to.have.been.calledWith({
        where: {
          establishmentFk: establishmentId,
          archived: false,
          trainingCategoryFk: 1,
        },
        raw: true,
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
        externalProviderName: null,
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
        externalProviderName: null,
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

  describe('GET /trainingCourse/:trainingCourseId - createTrainingCourse', () => {
    const mockTrainingCourseId = 123;
    const request = {
      method: 'GET',
      url: `${baseEndpoint}/${mockTrainingCourseId}`,
      establishmentId,
      username: mockUsername,
      params: { trainingCourseId: mockTrainingCourseId },
    };

    it('should respond with 200 and the training course data', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(mockTrainingCourses[0]);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal(expectedTrainingCoursesInResponse[0]);

      expect(models.trainingCourse.findOne).to.have.been.calledWith({
        where: {
          id: mockTrainingCourseId,
          establishmentFk: establishmentId,
          archived: false,
        },
        raw: true,
      });
    });

    it('should respond with 404 and if the training course is not found', async () => {
      sinon.stub(models.trainingCourse, 'findOne').resolves(null);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(404);
      expect(res._getData()).to.deep.equal({ message: 'Training course not found' });
    });

    it('should respond with 500 and if an error occurred', async () => {
      sinon.stub(models.trainingCourse, 'findOne').rejects(new sequelize.ConnectionError('some database error'));
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getTrainingCourse(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
