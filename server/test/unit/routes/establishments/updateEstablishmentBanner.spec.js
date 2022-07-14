const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Establishment = require('../../../../models/classes/establishment');

const { updateEstablishmentBanner } = require('../../../../routes/establishments/updateEstablishmentBanner');

describe('server/routes/establishments/updateEstablishmentBanner', () => {
  afterEach(async () => {
    sinon.restore();
  });

  describe('updateEstablishmentBanner', () => {
    let req;
    let res;
    let establishment;

    beforeEach(() => {
      const username = 'foo';
      const establishmentId = 'a131313dasd123325453bac';

      establishment = new Establishment.Establishment(username);

      sinon.stub(establishment, 'save');

      const request = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/updateEstablishmentBanner`,
        params: { establishmentId },
        body: { property: 'showAddWorkplaceDetailsBanner', value: false },
      };

      req = httpMocks.createRequest(request);

      req.username = username;
      req.establishmentId = 1234;
      res = httpMocks.createResponse();
    });

    it('should return 200 when the showAddWorkplaceDetailsBanner has been updated', async () => {
      sinon.stub(establishment, 'restore').returns(true);

      await updateEstablishmentBanner(req, res, establishment);
      expect(establishment._showAddWorkplaceDetailsBanner).to.equal(false);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 400 when establishment.load return false', async () => {
      sinon.stub(establishment, 'restore').returns(true);
      sinon.stub(establishment, 'load').returns(false);

      await updateEstablishmentBanner(req, res, establishment);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.deep.equal('Unexpected Input.');
    });

    it('should return 401 when the establishment is not restored', async () => {
      sinon.stub(establishment, 'restore').returns(false);

      await updateEstablishmentBanner(req, res, establishment);

      expect(res.statusCode).to.deep.equal(401);
      expect(res._getData()).to.deep.equal('Not Found');
    });
  });
});
