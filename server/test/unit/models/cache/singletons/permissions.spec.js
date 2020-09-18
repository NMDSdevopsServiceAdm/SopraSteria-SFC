const expect = require('chai').expect;
const { PermissionCache } = require('../../../../../models/cache/singletons/permissions');
const buildUser = require('../../../../factories/user');

describe('Permissions Cache', () => {
  it('should include become a parent permission if edit user', () => {
    const user = buildUser();
    const permissions = PermissionCache.myPermissions(user);

    expect(permissions.filter((permission) => permission.code === 'canBecomeAParent').length).to.deep.equal(1);
  });
  it('should not include become a parent permission if read only user', () => {
    const user = buildUser({
      overrides: {
        role: 'Read',
      },
    });
    const permissions = PermissionCache.myPermissions(user);

    expect(permissions.filter((permission) => permission.code === 'canBecomeAParent').length).to.deep.equal(0);
  });
});
