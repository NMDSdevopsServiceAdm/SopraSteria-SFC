const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

const { getAllTraining, getTrainingCategories } = require('../../../../../routes/establishments/training/getAllTraining');
const buildUser = require('../../../../factories/user');
const Training = require('../../../../../models/classes/training').Training;
const MandatoryTraining = require('../../../../../models/classes/mandatoryTraining').MandatoryTraining;
const { mockFormattedTraining, mockTrainingRecords } = require('../../../mockdata/training');

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
    });

    it('should reply with a status of 200', async () => {
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);
      await getAllTraining(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the data formatted with no training in the mandatory array', async () => {
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);
      await getAllTraining(req, res);
      const formattedTraining = await res._getJSONData();

      expect(formattedTraining.mandatory.length).to.equal(0);
      expect(formattedTraining.nonMandatory.length).to.equal(3);
      expect(formattedTraining).to.deep.equal({
        mandatory: [],
        nonMandatory: mockFormattedTraining
      });
    });

    it('should return the data formatted with training in both the mandatory array and non-mandatory array', async () => {
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([{ trainingCategoryFK: 1 }, { trainingCategoryFK: 3 }]);
      await getAllTraining(req, res);
      const formattedTraining = await res._getJSONData();

      expect(formattedTraining.mandatory.length).to.equal(2);
      expect(formattedTraining.nonMandatory.length).to.equal(1);
      expect(formattedTraining).to.deep.equal({
        mandatory: [mockFormattedTraining[0], mockFormattedTraining[2]],
        nonMandatory: [mockFormattedTraining[1]]
      });
    });

    it('should return the data formatted with no training in the non-mandatory array', async () => {
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([{ trainingCategoryFK: 1 },  { trainingCategoryFK: 2 }, { trainingCategoryFK: 3 }]);
      await getAllTraining(req, res);
      const formattedTraining = await res._getJSONData();

      expect(formattedTraining.mandatory.length).to.equal(3);
      expect(formattedTraining.nonMandatory.length).to.equal(0);
      expect(formattedTraining).to.deep.equal({
        mandatory: mockFormattedTraining,
        nonMandatory: []
      });
    });

    it('should return a 500 error code if an exception is thrown', async () => {
      sinon.restore();

      sinon.stub(Training, 'fetch').throws()
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);

      await getAllTraining(req, res);
      const error = res._getData();

      expect(res.statusCode).to.deep.equal(500);
      expect(error).to.contain('Failed to get TrainingRecords for Worker having uid:');
    });
  });
});
