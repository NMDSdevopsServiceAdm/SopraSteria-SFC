const expect = require('chai').expect;

const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const {
  createAndUpdateMandatoryTraining,
  deleteMandatoryTrainingById,
} = require('../../../../../routes/establishments/mandatoryTraining/index.js');

const MandatoryTraining = require('../../../../../models/classes/mandatoryTraining').MandatoryTraining;

describe('mandatoryTraining/index.js', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('deleteMandatoryTrainingById', () => {
    it('should delete a mandatory training category when it exists for an establishemnt', async () => {
      sinon.stub(MandatoryTraining.prototype, 'deleteMandatoryTrainingById');

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await deleteMandatoryTrainingById(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });
    it('should throw an error if it fails to delete the training', async () => {
      sinon.stub(MandatoryTraining.prototype, 'deleteMandatoryTrainingById').throws();

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await deleteMandatoryTrainingById(req, res);
      expect(res.statusCode).to.deep.equal(500);
    });
  });
  describe('createAndUpdateMandatoryTraining', () => {
    it('should save the record for mandatory training if isvalid , not exists and all job role is selected', async () => {
      sinon.stub(MandatoryTraining.prototype, 'load').callsFake(() => {
        return [
          {
            trainingCategoryId: 1,
            allJobRoles: true,
            jobs: [],
          },
        ];
      });
      sinon.stub(MandatoryTraining.prototype, 'save').callsFake(() => {
        return true;
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await createAndUpdateMandatoryTraining(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should save the record for mandatory training if isvalid , not exists and one job role is selected', async () => {
      sinon.stub(MandatoryTraining.prototype, 'load').callsFake(() => {
        return [{ trainingCategoryId: 2, allJobRoles: false, jobs: [{ id: '8' }] }];
      });
      sinon.stub(MandatoryTraining.prototype, 'save').callsFake(() => {
        return true;
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await createAndUpdateMandatoryTraining(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should not save the record for mandatory training if the record is not valid', async () => {
      sinon.stub(MandatoryTraining.prototype, 'load').throws();
      var save = sinon.stub(MandatoryTraining.prototype, 'save').callsFake();

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await createAndUpdateMandatoryTraining(req, res);

      sinon.assert.notCalled(save);
      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
