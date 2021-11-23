const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Establishment = require('../../../../models/classes/establishment');
const models = require('../../../../models');

const { sharingPermissionsBanner } = require('../../../../routes/establishments/sharingPermissionsBanner');

describe.only('server/routes/establishments/sharingPermissionsBanner', () => {
  afterEach(async () => {
    sinon.restore();
  });

  describe('sharingPermissionsBanner', () => {
    let req;
    let res;
    let establishment;

    beforeEach(() => {
      const username = 'foo';
      const establishmentId = 'a131313dasd123325453bac';

      establishment = new Establishment.Establishment(username);

      sinon.stub(establishment, 'save');
      sinon.stub(establishment, 'restore').returns(true);

      const request = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/updateSharingPermissionsBanner`,
        params: { establishmentId },
        body: { showPermissionsBannerFlag: false }
      };

      req = httpMocks.createRequest(request);

      req.username = username;
      // req.establishment = {
      //   id: establishmentId,
      // }
      req.establishmentId = 1234;
      res = httpMocks.createResponse();
    });

    it.only('should return 200 when the sharingPermissionBanner has been updated', async () => {
      // sinon.stub(models.establishment, 'findByUid').returns({
      //   uid: 'a131313dasd123325453bac',
      //   showSharingPermissionsBanner: true,
      //   save() {
      //     return true;
      //   },
      // });

      await sharingPermissionsBanner(req, res);
      expect(establishment._showSharingPermissionsBanner).to.equal(false);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 400 when the establishment cannot be found', async () => {
      sinon.stub(models.establishment, 'findByUid').returns(null);

      await sharingPermissionsBanner(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal({ error: 'Workplace could not be found' });
    });

    it('should return 500 when an error is thrown', async () => {
      sinon.stub(models.establishment, 'findByUid').throws();

      await sharingPermissionsBanner(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
