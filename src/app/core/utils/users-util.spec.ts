import { Roles } from '@core/model/roles.enum';

import { getUserPermissionsTypes } from './users-util';

describe('users-util', () => {
  describe('getUserPermissionTypes', () => {
    it('should return five permission types without primary types when false passed in for withPrimary', async () => {
      const returnedArray = getUserPermissionsTypes(false);

      const expectedUserTypeArray = [
        {
          permissionsQuestionValue: 'ASC-WDS edit with manage WDF claims',
          userTableValue: 'Edit and WDF',
          role: Roles.Edit,
          canManageWdfClaims: true,
        },
        {
          permissionsQuestionValue: 'ASC-WDS edit',
          userTableValue: Roles.Edit,
          role: Roles.Edit,
          canManageWdfClaims: false,
        },
        {
          permissionsQuestionValue: 'ASC-WDS read only with manage WDF claims',
          userTableValue: 'Read only and WDF',
          role: Roles.Read,
          canManageWdfClaims: true,
        },
        {
          permissionsQuestionValue: 'ASC-WDS read only',
          userTableValue: 'Read only',
          role: Roles.Read,
          canManageWdfClaims: false,
        },
        {
          permissionsQuestionValue: 'Manage WDF claims only',
          userTableValue: 'WDF',
          role: Roles.None,
          canManageWdfClaims: true,
        },
      ];

      expect(returnedArray).toEqual(expectedUserTypeArray);
    });

    it('should return seven permission types with primary types when true passed in for withPrimary', async () => {
      const returnedArray = getUserPermissionsTypes(true);

      const primaryEditAndWdfType = {
        userTableValue: 'Primary edit and WDF',
        role: Roles.Edit,
        canManageWdfClaims: true,
        isPrimary: true,
      };

      const primaryEditType = {
        userTableValue: 'Primary edit',
        role: Roles.Edit,
        canManageWdfClaims: false,
        isPrimary: true,
      };

      expect(returnedArray[5]).toEqual(primaryEditAndWdfType);
      expect(returnedArray[6]).toEqual(primaryEditType);
    });
  });
});
