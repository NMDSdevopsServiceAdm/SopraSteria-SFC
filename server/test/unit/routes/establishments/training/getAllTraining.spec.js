const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

const { getAllTraining, getTrainingCategories } = require('../../../../../routes/establishments/training/getAllTraining');
const buildUser = require('../../../../factories/user');
const Training = require('../../../../../models/classes/training').Training;
const MandatoryTraining = require('../../../../../models/classes/mandatoryTraining').MandatoryTraining;
const { mockNonMandatoryTraining, mockTrainingRecords } = require('../../../mockdata/training');

describe('server/routes/establishments/training/getAllTraining.js', () => {
  const user = buildUser();

  afterEach(() => {
    sinon.restore();
  });

  describe('getAllTraining', () => {
    let req;
    let res;

    beforeEach(() => {
      const workerId = user.uid;

      const request = {
        method: 'GET',
        url: `/api/establishment/${user.establishmentId}/worker/${workerId}/training/allTraining`,
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(Training, 'fetch').returns(
        { training: mockTrainingRecords }
      )

      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);
    });

    it('should reply with a status of 200', async () => {
      await getAllTraining(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the data formatted', async () => {
      await getAllTraining(req, res);
      const formattedTraining = await res._getJSONData();

      expect(formattedTraining.mandatory.length).to.equal(0);
      expect(formattedTraining.nonMandatory.length).to.equal(2);
      expect(formattedTraining).to.deep.equal({
        mandatory: [],
        nonMandatory: mockNonMandatoryTraining
      });
    });

    it('should return a 500 error code if an exception is thrown', async () => {
      sinon.restore();

      sinon.stub(Training, 'fetch').throws()

      await getAllTraining(req, res);
      const error = res._getData();

      expect(res.statusCode).to.deep.equal(500);
      expect(error).to.contain('Failed to get TrainingRecords for Worker having uid:');
    });
  });

  describe('getTrainingCategories', () => {
    it('returns the categories in the training array', () => {
      const trainingRecords = mockTrainingRecords;
      const trainingCategories = getTrainingCategories(mockTrainingRecords);

      expect(trainingCategories.length).to.equal(2);
      expect(trainingCategories).to.deep.equal([
        { id: 1, category: 'Communication' },
        { id: 2, category: 'Coshh' }
      ]);
    });
  });
});
