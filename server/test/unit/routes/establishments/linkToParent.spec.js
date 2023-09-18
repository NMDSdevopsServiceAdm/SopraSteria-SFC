const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const { linkToParent } = require('../../../../routes/establishments/linkToParent');
//const { linkSubToParent } = require('../../../../data/linkToParent');
const models = require('../../../../models');
const buildUser = require('../../../factories/user');

describe('server/routes/establishments/linkToParent', () => {
  const user = buildUser();
  const establishmentUid = '123-567';
  //user.establishment.uid;

  afterEach(() => {
    sinon.restore();
  });

  describe('getRequestedLinkToParent', () => {
    let req;
    let res;

    beforeEach(() => {
      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentUid}/linktoparent/requested`,
        body: { establishmentId: 12 },
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.LinkToParent, 'getLinkToParentUid').returns({ LinkToParentUID: '124-123' });
    });

    // it('should return a 400 error code if nothing is sent', async () => {
    //   sinon.restore();

    //   sinon.stub(linkToParent, 'getLinkToParentUid').throws();

    //   await linkToParent.getRequestedLinkToParent(req, res);
    //   const error = res._getData();

    //   expect(res.statusCode).to.deep.equal(400);
    // });

    it('should return a 500 error code if an exception is thrown', async () => {
      sinon.restore();

      // sinon.stub(linkToParent, 'getRequestedLinkToParent').throws();
      sinon.stub(models.LinkToParent, 'getLinkToParentUid').throws();

      await linkToParent.getRequestedLinkToParent(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
