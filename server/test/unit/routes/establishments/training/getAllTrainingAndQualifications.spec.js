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
const { mockQualificationRecords, expectedQualificationsSortedByGroup } = require('../../../mockdata/qualifications');

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

      sinon.stub(Training, 'fetch').returns({ lastUpdated: '2021-09-14T10:23:33.069Z', training: mockTrainingRecords });
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
          lastUpdated: '2021-09-14T10:23:33.069Z',
          jobRoleMandatoryTraining: [],
        },
        qualifications: { count: 0, groups: [], lastUpdated: null },
      });
    });

    it('should return the data formatted with training in both the mandatory array and non-mandatory array', async () => {
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([
        {
          trainingCategoryFK: 1,
          workerTrainingCategories: {
            id: 1,
            category: 'Communication',
          },
        },
        {
          trainingCategoryFK: 3,
          workerTrainingCategories: {
            id: 3,
            category: 'Hazards',
          },
        },
      ]);

      await getAllTrainingAndQualifications(req, res);
      const formattedTrainingAndQualifications = await res._getJSONData();

      const expectedJobRoleMandatoryTraining = [
        { id: mockFormattedTraining[0].id, category: mockFormattedTraining[0].category },
        { id: mockFormattedTraining[2].id, category: mockFormattedTraining[2].category },
      ];

      expect(formattedTrainingAndQualifications.training.mandatory.length).to.equal(2);
      expect(formattedTrainingAndQualifications.training.nonMandatory.length).to.equal(1);
      expect(formattedTrainingAndQualifications).to.deep.equal({
        training: {
          mandatory: [mockFormattedTraining[0], mockFormattedTraining[2]],
          nonMandatory: [mockFormattedTraining[1]],
          lastUpdated: '2021-09-14T10:23:33.069Z',
          jobRoleMandatoryTraining: expectedJobRoleMandatoryTraining,
        },
        qualifications: { count: 0, groups: [], lastUpdated: null },
      });
    });

    it('should return the data formatted with no training in the non-mandatory array', async () => {
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([
        {
          trainingCategoryFK: 1,
          workerTrainingCategories: {
            id: 1,
            category: 'Communication',
          },
        },
        {
          trainingCategoryFK: 2,
          workerTrainingCategories: {
            id: 2,
            category: 'Coshh',
          },
        },
        {
          trainingCategoryFK: 3,
          workerTrainingCategories: {
            id: 3,
            category: 'Hazards',
          },
        },
      ]);

      await getAllTrainingAndQualifications(req, res);
      const formattedTrainingAndQualifications = await res._getJSONData();

      const expectedJobRoleMandatoryTraining = [
        { id: mockFormattedTraining[0].id, category: mockFormattedTraining[0].category },
        { id: mockFormattedTraining[1].id, category: mockFormattedTraining[1].category },
        { id: mockFormattedTraining[2].id, category: mockFormattedTraining[2].category },
      ];

      expect(formattedTrainingAndQualifications.training.mandatory.length).to.equal(3);
      expect(formattedTrainingAndQualifications.training.nonMandatory.length).to.equal(0);
      expect(formattedTrainingAndQualifications).to.deep.equal({
        training: {
          mandatory: mockFormattedTraining,
          nonMandatory: [],
          lastUpdated: '2021-09-14T10:23:33.069Z',
          jobRoleMandatoryTraining: expectedJobRoleMandatoryTraining,
        },
        qualifications: { count: 0, groups: [], lastUpdated: null },
      });
    });

    it('should return the qualifications data formatted when qualifications returned from endpoint', async () => {
      sinon.restore();

      sinon.stub(Training, 'fetch').returns({ lastUpdated: '2021-09-14T10:23:33.069Z', training: [] });
      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);
      sinon.stub(Qualification, 'fetch').returns(mockQualificationRecords);

      await getAllTrainingAndQualifications(req, res);
      const formattedTrainingAndQualifications = await res._getJSONData();

      expect(formattedTrainingAndQualifications).to.deep.equal({
        training: {
          mandatory: [],
          nonMandatory: [],
          lastUpdated: '2021-09-14T10:23:33.069Z',
          jobRoleMandatoryTraining: [],
        },
        qualifications: expectedQualificationsSortedByGroup,
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
