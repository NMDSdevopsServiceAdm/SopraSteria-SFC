const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { permissionsCheck } = require('../../../../routes/establishments/permissions');
const permissions = require('../../../../utils/security/permissions');
const buildUser = require('../../../factories/user');

describe('permissions route', () => {
  const user = buildUser();

  afterEach(() => {
    sinon.restore();
  });

  function createReq() {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${user.establishmentId}/permissions`,
    });
    req.establishment = {
      uid: user.establishment.uid,
    };
    return req;
  }

  it('should return req uid and permissions returned from getPermissions', async () => {
    sinon.stub(permissions, 'getPermissions').callsFake(() => {
      return ['canDoEverything'];
    });
    const req = createReq();

    const res = httpMocks.createResponse();

    await permissionsCheck(req, res);

    const permissionData = res._getJSONData();
    expect(res.statusCode).to.deep.equal(200);
    expect(permissionData.permissions).to.deep.equal(['canDoEverything']);
  });

  it('should return a 500 error if cannot get permissions', async () => {
    sinon.stub(permissions, 'getPermissions').throws();

    const req = createReq();

    const res = httpMocks.createResponse();

    await permissionsCheck(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
