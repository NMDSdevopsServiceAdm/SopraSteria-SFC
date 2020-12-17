const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../models');
const { permissions, permissionsCheck } = require('../../../../routes/establishments/permissions');
const buildUser = require('../../../factories/user');
const { establishmentBuilder } = require('../../../factories/models');
const { Establishment } = require('../../../../models/classes/establishment');

describe('permissions route', () => {
  const user = buildUser();
  user.created = {
    toJSON: () => {},
  };
  user.updated = {
    toJSON: () => {},
  };

  beforeEach(() => {
    sinon.stub(models.user, 'findOne').callsFake(() => {
      return user;
    });
    sinon.stub(models.establishment, 'findOne').callsFake(() => {
      return establishmentBuilder();
    });
    sinon.stub(Establishment.prototype, 'restore');
    sinon.stub(models.Approvals, 'becomeAParentRequests');
    sinon.stub(Establishment.prototype, 'mainService').value({
      id: 8,
    });
  });

  afterEach(() => {
    sinon.restore();
  });
  function createReq() {
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
      uid: user.establishment.uid,
    };
    return req;
  }
});
