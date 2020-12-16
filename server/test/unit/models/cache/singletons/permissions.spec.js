const expect = require('chai').expect;
const { PermissionCache } = require('../../../../../models/cache/singletons/permissions');
const buildUser = require('../../../../factories/user');
const sinon = require('sinon');
const { Establishment } = require('../../../../../models/classes/establishment');

describe.only('Permissions Cache', () => {
  beforeEach(() => {
    sinon.stub(Establishment.prototype, 'restore');
    sinon.stub(Establishment.prototype, 'mainService').value({
      id: 8,
    });
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should include become a parent permission if edit user', async () => {
    const user = buildUser();
    const req = {
      username: user.username,
      role: 'Edit',
      establishment: {
        isSubsidiary: false,
        isParent: false,
      },
    };
    const permissions = await PermissionCache.myPermissions(req);
    const filteredPerms = permissions.filter((permission) => Object.keys(permission)[0] === 'canBecomeAParent');

    expect(filteredPerms.length).to.deep.equal(1);
  });
  it('should not include become a parent permission if read only user', async () => {
    const req = {
      role: 'Read',
      establishment: {
        isSubsidiary: false,
        isParent: false,
      },
    };
    const permissions = await PermissionCache.myPermissions(req);
    const filteredPerms = permissions.filter((permission) => Object.keys(permission)[0] === 'canBecomeAParent');

    expect(filteredPerms.length).to.deep.equal(0);
  });
});
