const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../models');
const permissions = require('../../../../routes/establishments/permissions').permissions;
const buildUser = require('../../../factories/user');
const {establishmentBuilder} = require('../../../factories/models');

describe.skip('permissions route', () => {
  const user = buildUser();

  user.created = {
    toJSON: () => {}
  };
  user.updated = {
    toJSON: () => {}
  };

  beforeEach(() => {
    sinon.stub(models.user, 'findOne').callsFake(() => {
      return user;
    });
    sinon.stub(models.establishment, 'findOne').callsFake(() => {
      return establishmentBuilder();
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return canBecomeParent permission if no pending requests', async () => {
    sinon.stub(models.Approvals, 'findOne').callsFake(() => {
      return null;
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${user.establishmentId}/permissions`,
    });

    req.username = user.username;
    req.establishmentId = user.establishmentId;
    req.userUid = user.userUid;
    req.role = user.role;
    req.isParent = user.isParent;
    req.establishment = {
      id: user.establishmentId,
      uid:  user.establishment.uid
    };

    const res = httpMocks.createResponse();

    await permissions(req, res);

    const permissionData = res._getJSONData();

    expect(res.statusCode).to.deep.equal(200);
    expect(permissionData.permissions.canBecomeAParent).to.deep.equal(true);
  });

  it('should not return canBecomeParent permission if pending requests', async () => {
    sinon.stub(models.Approvals, 'findOne').callsFake(() => {
      return {
        id: 123
      };
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${user.establishmentId}/permissions`,
    });

    req.username = user.username;
    req.establishmentId = user.establishmentId;
    req.userUid = user.userUid;
    req.role = user.role;
    req.isParent = user.isParent;
    req.establishment = {
      id: user.establishmentId,
      uid:  user.establishment.uid
    };

    const res = httpMocks.createResponse();

    await permissions(req, res);

    const permissionData = res._getJSONData();

    expect(res.statusCode).to.deep.equal(200);
    expect(permissionData.permissions.canBecomeAParent).to.deep.equal(false);
  });
});
