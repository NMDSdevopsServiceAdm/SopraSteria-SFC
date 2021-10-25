const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const {
  getAllTrainingAndQualifications,
} = require('../../../../../routes/establishments/trainingAndQualifications/getAllTrainingAndQualifications');
const buildUser = require('../../../../factories/user');
const Training = require('../../../../../models/classes/training').Training;
const MandatoryTraining = require('../../../../../models/classes/mandatoryTraining').MandatoryTraining;
const Qualification = require('../../../../../models/classes/qualification').Qualification;
const { mockFormattedTraining, mockTrainingRecords } = require('../../../mockdata/training');

describe('server/routes/establishments/trainingAndQualifications/getAllTrainingAndQualifications.js', () => {
  const user = buildUser();

  afterEach(() => {
    sinon.restore();
  });

  describe('getAllTrainingAndQualifications', () => {
    let req;
    let res;

    beforeEach(() => {
      const workerId = user.uid;

      const request = {
        method: 'GET',
        url: `/api/establishment/${user.establishmentId}/worker/${workerId}/trainingAndQualifications/getAllTrainingAndQualifications`,
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(Training, 'fetch').returns({ training: mockTrainingRecords });
      sinon.stub(Qualification, 'fetch').returns(null);
    });

    it('should reply with a status of 200', async () => {
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);
      await getAllTrainingAndQualifications(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the data formatted with no training in the mandatory array', async () => {
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);
      await getAllTrainingAndQualifications(req, res);
      const formattedTrainingAndQualifications = await res._getJSONData();

      expect(formattedTrainingAndQualifications.training.mandatory.length).to.equal(0);
      expect(formattedTrainingAndQualifications.training.nonMandatory.length).to.equal(3);
      expect(formattedTrainingAndQualifications).to.deep.equal({
        training: {
          mandatory: [],
          nonMandatory: mockFormattedTraining,
        },
        qualifications: { count: 0, groups: [] },
      });
    });

    it('should return the data formatted with training in both the mandatory array and non-mandatory array', async () => {
      sinon
        .stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker')
        .returns([{ trainingCategoryFK: 1 }, { trainingCategoryFK: 3 }]);
      await getAllTrainingAndQualifications(req, res);
      const formattedTrainingAndQualifications = await res._getJSONData();

      expect(formattedTrainingAndQualifications.training.mandatory.length).to.equal(2);
      expect(formattedTrainingAndQualifications.training.nonMandatory.length).to.equal(1);
      expect(formattedTrainingAndQualifications).to.deep.equal({
        training: {
          mandatory: [mockFormattedTraining[0], mockFormattedTraining[2]],
          nonMandatory: [mockFormattedTraining[1]],
        },
        qualifications: { count: 0, groups: [] },
      });
    });

    it('should return the data formatted with no training in the non-mandatory array', async () => {
      sinon
        .stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker')
        .returns([{ trainingCategoryFK: 1 }, { trainingCategoryFK: 2 }, { trainingCategoryFK: 3 }]);
      await getAllTrainingAndQualifications(req, res);
      const formattedTrainingAndQualifications = await res._getJSONData();

      expect(formattedTrainingAndQualifications.training.mandatory.length).to.equal(3);
      expect(formattedTrainingAndQualifications.training.nonMandatory.length).to.equal(0);
      expect(formattedTrainingAndQualifications).to.deep.equal({
        training: {
          mandatory: mockFormattedTraining,
          nonMandatory: [],
        },
        qualifications: { count: 0, groups: [] },
      });
    });

    it('should return a 500 error code if an exception is thrown', async () => {
      sinon.restore();

      sinon.stub(Training, 'fetch').throws();
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);

      await getAllTrainingAndQualifications(req, res);
      const error = res._getData();

      expect(res.statusCode).to.deep.equal(500);
      expect(error).to.contain('Failed to get training and qualification records for Worker with uid:');
    });
  });
});
