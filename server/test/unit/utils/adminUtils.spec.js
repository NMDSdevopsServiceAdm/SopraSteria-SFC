const expect = require('chai').expect;
const { isAdminRole } = require('../../../utils/adminUtils');

describe('adminUtils', () => {
  describe('isAdminRole()', () => {
    it('should return true if passed in role is Admin', () => {
      expect(isAdminRole('Admin')).to.equal(true);
    });

    it('should return true if passed in role is AdminManager', () => {
      expect(isAdminRole('AdminManager')).to.equal(true);
    });

    it('should return false if passed in role is not an existing Admin role', () => {
      expect(isAdminRole('Edit')).to.equal(false);
    });
  });
});
