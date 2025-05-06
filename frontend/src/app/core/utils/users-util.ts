import { Roles } from '@core/model/roles.enum';
import { UserPermissionsType } from '@core/model/userDetails.model';

export const getUserPermissionsTypes = (withPrimary: boolean): UserPermissionsType[] => {
  const userPermissionTypes: UserPermissionsType[] = [
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

  if (withPrimary) {
    const primaryRoles = [
      {
        userTableValue: 'Primary edit',
        role: Roles.Edit,
        isPrimary: true,
      },
    ];

    userPermissionTypes.push(...primaryRoles);
  }

  return userPermissionTypes;
};
