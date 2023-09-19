const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const { getRequestedLinkToParent } = require('../../../../routes/establishments/linkToParent');
const models = require('../../../../models');
const buildUser = require('../../../factories/user');

describe('server/routes/establishments/linkToParent', () => {
  const user = buildUser();
  const establishmentUid = user.establishment.uid;

  afterEach(() => {
    sinon.restore();
  });

  describe('getRequestedLinkToParent', () => {
    function createReq() {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: `/api/establishment/${establishmentUid}/linktoparent/requested`,
      });
      req.body = {
        establishmentId: 122,
      };
      return req;
    }

    const linkToParentUID = { LinkToParentUID: '124-123' };

    const linkToParentRequestDetails = {
      ApprovalStatus: 'REQUESTED',
      PermissionRequest: 'Workplace',
      SubEstablishmentID: 122,
      ParentEstablishment: {
        EstablishmentID: 5,
        PostCode: 'LE2 1RQ',
        NameValue: 'Parent LA',
      },
    };

    it('should return a 200 status code and correct data', async () => {
      const req = createReq();

      const res = httpMocks.createResponse();

      sinon.stub(models.LinkToParent, 'getLinkToParentUid').returns(linkToParentUID);
      sinon.stub(models.LinkToParent, 'getLinkToParentRequestDetails').returns(linkToParentRequestDetails);

      await getRequestedLinkToParent(req, res);
      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal(linkToParentRequestDetails);
    });

    it('should return a 400 error code if no data is found', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();

      sinon.stub(models.LinkToParent, 'getLinkToParentUid').returns();
      sinon.stub(models.LinkToParent, 'getLinkToParentRequestDetails').returns();

      await getRequestedLinkToParent(req, res);
      const { message } = res._getData();

      expect(res.statusCode).to.deep.equal(400);
      expect(message).to.deep.equal('Invalid request');
    });

    it('should return a 400 error code if establishmentId is not sent', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();
      req.body = null;

      sinon.stub(models.LinkToParent, 'getLinkToParentUid').returns();
      sinon.stub(models.LinkToParent, 'getLinkToParentRequestDetails').returns();

      await getRequestedLinkToParent(req, res);
      const { message } = res._getData();

      expect(res.statusCode).to.deep.equal(400);
      expect(message).to.deep.equal('Invalid request');
    });

    it('should return a 500 error code if an exception is thrown by getLinkToParentUid', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();

      sinon.stub(models.LinkToParent, 'getLinkToParentUid').throws();

      await getRequestedLinkToParent(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return a 500 error code if an exception is thrown by getLinkToParentRequestDetails', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();

      sinon.stub(models.LinkToParent, 'getLinkToParentUid').returns(linkToParentRequestDetails);
      sinon.stub(models.LinkToParent, 'getLinkToParentRequestDetails').throws();

      await getRequestedLinkToParent(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
