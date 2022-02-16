import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';

import { getUserPermissionsTypes, getUserType } from './users-util';

describe('users-util', () => {
  describe('getUserPermissionTypes', () => {
    it('should return five permission types without primary types when false passed in for withPrimary', () => {
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
        permissionsQuestionValue: 'ASC-WDS edit with manage WDF claims',
        userTableValue: 'Primary edit and WDF',
        role: Roles.Edit,
        canManageWdfClaims: true,
        isPrimary: true,
      };

      const primaryEditType = {
        permissionsQuestionValue: 'ASC-WDS edit',
        userTableValue: 'Primary edit',
        role: Roles.Edit,
        canManageWdfClaims: false,
        isPrimary: true,
      };

      expect(returnedArray[5]).toEqual(primaryEditAndWdfType);
      expect(returnedArray[6]).toEqual(primaryEditType);
    });
  });

  describe('getUserType', () => {
    let user: UserDetails;
    beforeEach(() => {
      user = {
        email: 'test@email.com',
        fullname: 'Mr Bob',
        jobTitle: 'Care Worker',
        phone: '01234556688',
      };
    });

    describe('userTableValue', () => {
      describe('Edit users', () => {
        it('should return Edit and WDF when user role is Edit, canManageWdfClaims is true and isPrimary is false', () => {
          user = {
            ...user,
            role: Roles.Edit,
            canManageWdfClaims: true,
            isPrimary: false,
          };

          const returnedValue = getUserType(user);

          expect(returnedValue).toEqual('Edit and WDF');
        });

        it('should return ASC-WDS edit when user role is Edit, canManageWdfClaims is false and isPrimary is false', () => {
          user = {
            ...user,
            role: Roles.Edit,
            canManageWdfClaims: false,
            isPrimary: false,
          };

          const returnedValue = getUserType(user);

          expect(returnedValue).toEqual('Edit');
        });

        it('should return Primary edit and WDF when user role is Edit, canManageWdfClaims is true and isPrimary is true', () => {
          user = {
            ...user,
            role: Roles.Edit,
            canManageWdfClaims: true,
            isPrimary: true,
          };

          const returnedValue = getUserType(user);

          expect(returnedValue).toEqual('Primary edit and WDF');
        });

        it('should return Primary edit when user role is Edit, canManageWdfClaims is false and isPrimary is true', () => {
          user = {
            ...user,
            role: Roles.Edit,
            canManageWdfClaims: false,
            isPrimary: true,
          };

          const returnedValue = getUserType(user);

          expect(returnedValue).toEqual('Primary edit');
        });
      });

      describe('Read users', () => {
        it('should return Read only and WDF when user role is Read and canManageWdfClaims is true', () => {
          user = {
            ...user,
            role: Roles.Read,
            canManageWdfClaims: true,
          };

          const returnedValue = getUserType(user);

          expect(returnedValue).toEqual('Read only and WDF');
        });

        it('should return Read only when user role is Read and canManageWdfClaims is false', () => {
          user = {
            ...user,
            role: Roles.Read,
            canManageWdfClaims: false,
          };

          const returnedValue = getUserType(user);

          expect(returnedValue).toEqual('Read only');
        });
      });

      it('should return WDF when user role is None and canManageWdfClaims is true', () => {
        user = {
          ...user,
          role: Roles.None,
          canManageWdfClaims: true,
        };

        const returnedValue = getUserType(user);

        expect(returnedValue).toEqual('WDF');
      });
    });

    describe('permissionsQuestionValue', () => {
      describe('Edit users', () => {
        it('should return Edit and WDF when user role is Edit, canManageWdfClaims is true and isPrimary is false', () => {
          user = {
            ...user,
            role: Roles.Edit,
            canManageWdfClaims: true,
            isPrimary: false,
          };

          const returnedValue = getUserType(user, true);

          expect(returnedValue).toEqual('ASC-WDS edit with manage WDF claims');
        });

        it('should return ASC-WDS edit when user role is Edit, canManageWdfClaims is false and isPrimary is false', () => {
          user = {
            ...user,
            role: Roles.Edit,
            canManageWdfClaims: false,
            isPrimary: false,
          };

          const returnedValue = getUserType(user, true);

          expect(returnedValue).toEqual('ASC-WDS edit');
        });

        it('should return ASC-WDS edit with manage WDF claims when user role is Edit, canManageWdfClaims is true and isPrimary is true', () => {
          user = {
            ...user,
            role: Roles.Edit,
            canManageWdfClaims: true,
            isPrimary: true,
          };

          const returnedValue = getUserType(user, true);

          expect(returnedValue).toEqual('ASC-WDS edit with manage WDF claims');
        });

        it('should return ASC-WDS edit when user role is Edit, canManageWdfClaims is false and isPrimary is true', () => {
          user = {
            ...user,
            role: Roles.Edit,
            canManageWdfClaims: false,
            isPrimary: true,
          };

          const returnedValue = getUserType(user, true);

          expect(returnedValue).toEqual('ASC-WDS edit');
        });
      });

      describe('Read users', () => {
        it('should return Read only and WDF when user role is Read and canManageWdfClaims is true', () => {
          user = {
            ...user,
            role: Roles.Read,
            canManageWdfClaims: true,
          };

          const returnedValue = getUserType(user, true);

          expect(returnedValue).toEqual('ASC-WDS read only with manage WDF claims');
        });

        it('should return Read only when user role is Read and canManageWdfClaims is false', () => {
          user = {
            ...user,
            role: Roles.Read,
            canManageWdfClaims: false,
          };

          const returnedValue = getUserType(user, true);

          expect(returnedValue).toEqual('ASC-WDS read only');
        });
      });

      it('should return WDF when user role is None and canManageWdfClaims is true', () => {
        user = {
          ...user,
          role: Roles.None,
          canManageWdfClaims: true,
        };

        const returnedValue = getUserType(user, true);

        expect(returnedValue).toEqual('Manage WDF claims only');
      });
    });
  });
});
