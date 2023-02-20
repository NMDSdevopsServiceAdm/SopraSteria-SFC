const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const Training = require('../../../../../models/classes/training').Training;
const { mockTrainingRecords, mockMissingMandatoryTraining } = require('../../../mockdata/training');
const {
  getAllTrainingByStatus,
  getMissingMandatoryTraining,
} = require('../../../../../routes/establishments/trainingSummary/getAllWorkersTrainingByStatus');
const models = require('../../../../../models');

describe('server/routes/establishments/trainingAndQualifications/getAllTrainingAndQualifications.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getAllTrainingByStatus', () => {
    let req;
    let res;

    beforeEach(() => {
      const request = {
        method: 'GET',
        url: '/api/establishment/mocked-uid/trainingAndQualifications/expired',
        params: { status: 'expired' },
        establishmentId: 'mocked-uid',
        query: { itemsPerPage: '15', pageIndex: '0', sortBy: 'staffNameAsc', searchTerm: '' },
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    it('should return a status of 200 when retrieving expired training', async () => {
      sinon.stub(Training, 'getAllEstablishmentTrainingByStatus').returns({ rows: mockTrainingRecords, count: 4 });

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({ training: mockTrainingRecords, trainingCount: 4 });
    });

    it('should return a status of 200 when retrieving expiring training', async () => {
      req.params.status = 'expiring';
      sinon.stub(Training, 'getAllEstablishmentTrainingByStatus').returns({ rows: mockTrainingRecords, count: 4 });

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({ training: mockTrainingRecords, trainingCount: 4 });
    });

    it('should return a status of 400 and error message if there is no establishment id', async () => {
      req.establishmentId = null;

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal('The establishment id and status must be given');
    });

    it('should return a status of 400 and error message if there is no status', async () => {
      req.params = { status: null };

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal('The establishment id and status must be given');
    });

    it('should return a status of 500 when an error is thrown', async () => {
      sinon.stub(Training, 'getAllEstablishmentTrainingByStatus').throws(new Error());

      await getAllTrainingByStatus(req, res);

      expect(res.statusCode).to.deep.equal(500);
      expect(res._getData()).to.deep.equal(
        'Failed to get expired training and qualifications for establishment mocked-uid',
      );
    });
  });

  describe('getMissingMandatoryTraining', () => {
    let req;
    let res;

    beforeEach(() => {
      const request = {
        method: 'GET',
        url: '/api/establishment/mocked-uid/trainingAndQualifications/missing-training',
        establishmentId: 'mocked-uid',
        query: { itemsPerPage: '15', pageIndex: '0', sortBy: 'staffNameAsc', searchTerm: '' },
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    it('should return a status of 200 when retrieving missing mandatory training', async () => {
      sinon
        .stub(models.establishment, 'getWorkersWithMissingMandatoryTraining')
        .returns({ rows: [{ workers: mockMissingMandatoryTraining }], count: 2 });

      await getMissingMandatoryTraining(req, res);

      const formattedTraining = mockMissingMandatoryTraining.map((worker) => {
        return {
          name: worker.NameOrIdValue,
          missingTraining: worker.mainJob.MandatoryTraining.map((training) => {
            return { category: training.workerTrainingCategories.get('cate') };
          }),
        };
      });

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({ missingTraining: formattedTraining, count: 2 });
    });

    it('should return a status of 400 and error message if there is no establishment id', async () => {
      req.establishmentId = null;

      await getMissingMandatoryTraining(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal('The establishment id must be given');
    });

    it('should return a status of 500 when an error is thrown', async () => {
      sinon.stub(models.establishment, 'getWorkersWithMissingMandatoryTraining').throws(new Error());

      await getMissingMandatoryTraining(req, res);

      expect(res.statusCode).to.deep.equal(500);
      expect(res._getData()).to.deep.equal('Failed to get missing training for establishment mocked-uid');
    });
  });
});
