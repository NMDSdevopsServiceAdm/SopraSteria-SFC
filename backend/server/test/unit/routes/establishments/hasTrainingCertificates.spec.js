const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const { workplaceOrSubHasTrainingCertificates } = require('../../../../routes/establishments/hasTrainingCertificates');

describe('server/routes/establishments/hasTrainingCertificates', () => {
  const establishmentId = 'a131313dasd123325453bac';
  const request = {
    method: 'GET',
    url: `/api/establishment/${establishmentId}/hasTrainingCertificates`,
    establishmentId,
  };

  let req;
  let res;

  beforeEach(() => {
    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('workplaceOrSubHasTrainingCertificates', () => {
    it('should return 200 status and false when single workplace has no workers with training certificates', async () => {
      sinon.stub(models.establishment, 'getTrainingCertificatesForWorkplaceAndAnySubs').returns([
        {
          id: 123,
          workers: [
            {
              workerTraining: [
                {
                  trainingCertificates: [],
                },
              ],
            },
          ],
        },
      ]);

      await workplaceOrSubHasTrainingCertificates(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.hasTrainingCertificates).to.equal(false);
    });

    it('should return 200 status and true when single workplace has workers with training certificates', async () => {
      sinon.stub(models.establishment, 'getTrainingCertificatesForWorkplaceAndAnySubs').returns([
        {
          id: 123,
          workers: [
            {
              workerTraining: [
                {
                  trainingCertificates: [],
                },
                {
                  trainingCertificates: [{ id: 123 }],
                },
              ],
            },
          ],
        },
      ]);

      await workplaceOrSubHasTrainingCertificates(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.hasTrainingCertificates).to.equal(true);
    });

    it('should return 200 status and false when several workplaces which do not have workers with training certificates', async () => {
      sinon.stub(models.establishment, 'getTrainingCertificatesForWorkplaceAndAnySubs').returns([
        {
          id: 123,
          workers: [
            {
              workerTraining: [
                {
                  trainingCertificates: [],
                },
              ],
            },
          ],
        },
        {
          id: 456,
          workers: [],
        },
        {
          id: 789,
          workers: [
            {
              workerTraining: [
                {
                  trainingCertificates: [],
                },
                {
                  trainingCertificates: [],
                },
              ],
            },
          ],
        },
      ]);

      await workplaceOrSubHasTrainingCertificates(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.hasTrainingCertificates).to.equal(false);
    });

    it('should return 200 status and true when several workplaces where one has a worker with a training certificate', async () => {
      sinon.stub(models.establishment, 'getTrainingCertificatesForWorkplaceAndAnySubs').returns([
        {
          id: 123,
          workers: [
            {
              workerTraining: [
                {
                  trainingCertificates: [],
                },
              ],
            },
          ],
        },
        {
          id: 456,
          workers: [],
        },
        {
          id: 789,
          workers: [
            {
              workerTraining: [
                {
                  trainingCertificates: [],
                },
                {
                  trainingCertificates: [{ id: 12 }],
                },
              ],
            },
          ],
        },
      ]);

      await workplaceOrSubHasTrainingCertificates(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.hasTrainingCertificates).to.equal(true);
    });

    it('should return 500 status and default error message when DB call throws error', async () => {
      sinon.stub(models.establishment, 'getTrainingCertificatesForWorkplaceAndAnySubs').throws();

      await workplaceOrSubHasTrainingCertificates(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.equal('Failed to complete check for training certificates');
    });
  });
});
