const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');
const { fetchAllTrainingCourses } = require('../../../../../routes/establishments/trainingCourse/controllers');
const { mockTrainingCourses, expectedTrainingCoursesInResponse } = require('../../../mockdata/trainingCourse');

describe.only('/api/establishment/:uid/trainingCourse/', () => {
  afterEach(() => {
    sinon.restore();
  });
  const establishmentUid = 'mock-uid';
  const establishmentId = 'mock-id';
  const baseEndpoint = `/api/establishment/${establishmentUid}/trainingCourse`;

  describe('GET /trainingCourse/ - fetchAllTrainingCourses', () => {
    const request = {
      method: 'GET',
      url: baseEndpoint,
      establishmentId,
    };

    it('should respond with 200 and a list of all training courses', async () => {
      sinon.stub(models.TrainingCourse, 'findAll').resolves(mockTrainingCourses);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: expectedTrainingCoursesInResponse });

      expect(models.TrainingCourse.findAll).to.have.been.calledWith({
        where: {
          establishmentFk: establishmentId,
          archived: false,
        },
        raw: true,
      });
    });

    it('should respond with 200 and an empty list if no training courses in the workplace', async () => {
      sinon.stub(models.TrainingCourse, 'findAll').resolves([]);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: [] });
    });

    it('should be able to accept a query of categoryId and return the training courses of that category', async () => {
      sinon.stub(models.TrainingCourse, 'findAll').resolves(mockTrainingCourses);

      const req = httpMocks.createRequest({ ...request, query: { trainingCategoryId: 1 } });
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.deep.equal({ trainingCourses: expectedTrainingCoursesInResponse });

      expect(models.TrainingCourse.findAll).to.have.been.calledWith({
        where: {
          establishmentFk: establishmentId,
          archived: false,
          trainingCategoryFk: 1,
        },
        raw: true,
      });
    });

    it('should respond with 500 if an error occured during operation', async () => {
      sinon.stub(models.TrainingCourse, 'findAll').throws(new Error('database error'));
      sinon.stub(console, 'error'); // suppress error msg in test log

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await fetchAllTrainingCourses(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('POST /trainingCourse/ - createTrainingCourse', () => {
    it('should respond with 200 and create the training course');
    it('should respond with 400 if some fields are incorrect');
    it('should respond with 500 if other error occured');
  });
});
