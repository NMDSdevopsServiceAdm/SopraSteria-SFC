const models = require('../../../../models/index');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const expect = require('chai').expect;
const { validateBecomeAParentRequest } = require('../../../../routes/approvals/becomeAParent');

describe('test become a parent endpoint functions', () => {
  describe('validateBecomeAParentRequest', () => {
    afterEach(() => {
      sinon.restore();
    });

    it ('sets user id on the request object', async () => {
      const userId = '123';
      const establishmentId = '123';

      sinon.stub(models.user, 'findByUUID').callsFake(() => {
        return {
          id: userId,
        };
      });

      sinon.stub(models.establishment, 'findByPk').callsFake(() => {
        return {
          id: establishmentId,
        };
      });

      sinon.stub(models.Approvals, 'canRequest').callsFake(() => {
        return true;
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/approvals/become-a-parent`,
      });

      req.userUid = '123';
      req.establishment = {
        id: establishmentId,
      }

      const res = httpMocks.createResponse();

      const next = function () {
      };

      await validateBecomeAParentRequest(req, res, next);

      expect(req.userId).equals('123');
    });
  });
});
