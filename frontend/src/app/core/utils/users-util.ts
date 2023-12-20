import { Roles } from '@core/model/roles.enum';
import { UserPermissionsType } from '@core/model/userDetails.model';

export const getUserPermissionsTypes = (withPrimary: boolean): UserPermissionsType[] => {
  const userPermissionTypes: UserPermissionsType[] = [
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

  if (withPrimary) {
    const primaryRoles = [
      {
        userTableValue: 'Primary edit and WDF',
        role: Roles.Edit,
        canManageWdfClaims: true,
        isPrimary: true,
      },
      {
        userTableValue: 'Primary edit',
        role: Roles.Edit,
        canManageWdfClaims: false,
        isPrimary: true,
      },
    ];

    userPermissionTypes.push(...primaryRoles);
  }

  return userPermissionTypes;
};
