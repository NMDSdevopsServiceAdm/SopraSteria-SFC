const expect = require('chai').expect;
const { isAdmin } = require('../../../utils/adminUtils');

describe('adminUtils', () => {
  describe('isAdmin()', () => {
    it('should return true if passed in role is Admin', () => {
      expect(isAdmin('Admin')).to.equal(true);
    });

    it('should return true if passed in role is AdminManager', () => {
      expect(isAdmin('AdminManager')).to.equal(true);
    });

    it('should return false if passed in role is not an existing Admin role', () => {
      expect(isAdmin('Edit')).to.equal(false);
    });
  });
});
