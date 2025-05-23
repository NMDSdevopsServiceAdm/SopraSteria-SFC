import { Roles } from '@core/model/roles.enum';

import { getUserPermissionsTypes } from './users-util';

describe('users-util', () => {
  describe('getUserPermissionTypes', () => {
    it('should return permission types without primary types when false passed in for withPrimary', async () => {
      const returnedArray = getUserPermissionsTypes(false);

      const expectedUserTypeArray = [
        {
          permissionsQuestionValue: 'ASC-WDS edit',
          userTableValue: Roles.Edit,
          role: Roles.Edit,
        },
        {
          permissionsQuestionValue: 'ASC-WDS read only',
          userTableValue: 'Read only',
          role: Roles.Read,
        },
      ];

      expect(returnedArray).toEqual(expectedUserTypeArray);
    });

    it('should return permission type with primary type when true passed in for withPrimary', async () => {
      const returnedArray = getUserPermissionsTypes(true);

      const primaryEditType = {
        userTableValue: 'Primary edit',
        role: Roles.Edit,
        isPrimary: true,
      };

      expect(returnedArray[2]).toEqual(primaryEditType);
    });
  });
});
