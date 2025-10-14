const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

describe('/api/establishment/:uid/trainingCourse/', () => {
  describe('GET /trainingCourse/ - fetchAllTrainingCourses', () => {
    it('should respond with 200 and a list of all training courses');
    it('should respond with 200 and an empty list if no training courses in the workplace');
    it('should be able to accept a param of categoryId and return the training courses of the category');
    it('should respond with 500 if error occured');
  });

  describe('POST /trainingCourse/ - createTrainingCourse', () => {
    it('should respond with 200 and create the training course');
    it('should respond with 400 if some fields are incorrect');
    it('should respond with 500 if other error occured');
  });
});
