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
    it('should return 200 status and hasTrainingCertificates as false when false returned from DB query', async () => {
      sinon.stub(models.establishment, 'workplaceOrSubHasAtLeastOneTrainingCertificate').returns(false);

      await workplaceOrSubHasTrainingCertificates(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.hasTrainingCertificates).to.equal(false);
    });

    it('should return 200 status and hasTrainingCertificates as true when true returned from DB query', async () => {
      sinon.stub(models.establishment, 'workplaceOrSubHasAtLeastOneTrainingCertificate').returns(true);

      await workplaceOrSubHasTrainingCertificates(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.hasTrainingCertificates).to.equal(true);
    });

    it('should return 500 status and default error message when DB call throws error', async () => {
      sinon.stub(models.establishment, 'workplaceOrSubHasAtLeastOneTrainingCertificate').throws();

      await workplaceOrSubHasTrainingCertificates(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.equal('Failed to complete check for training certificates');
    });
  });
});
