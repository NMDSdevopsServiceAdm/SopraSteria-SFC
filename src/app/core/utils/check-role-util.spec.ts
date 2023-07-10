import { isAdminRole } from './check-role-util';

describe('check-role-util', () => {
  describe('isAdminRole', () => {
    it('should return true if the role is an Admin', () => {
      const isAdmin = isAdminRole('Admin');
      expect(isAdmin).toBeTruthy();
    });

    it('should return true if the role is an AdminManager', () => {
      const isAdmin = isAdminRole('AdminManager');
      expect(isAdmin).toBeTruthy();
    });

    it('should return false if the role is not Admin or AdminManager', () => {
      const isAdmin = isAdminRole('Edit');
      expect(isAdmin).toBeFalsy();
    });
  });
});
