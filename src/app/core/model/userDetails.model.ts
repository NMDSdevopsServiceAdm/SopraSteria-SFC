import { Roles } from './roles.enum';

// TODO split this interface its use cases require a subset of properties
export interface UserDetails {
  created?: string;
  email: string;
  establishmentId?: number;
  establishmentUid?: string;
  fullname: string;
  isPrimary?: boolean;
  jobTitle: string;
  lastLoggedIn?: string;
  agreedUpdatedTerms?: boolean;
  migratedUser?: boolean;
  migratedUserFirstLogon?: boolean;
  phone: string;
  role?: Roles;
  registrationSurveyCompleted?: boolean;
  securityQuestion?: string;
  securityQuestionAnswer?: string;
  status?: UserStatus;
  password?: string;
  uid?: string;
  updated?: string;
  updatedBy?: string;
  username?: string;
  canManageWdfClaims?: boolean;
}

export enum UserStatus {
  Pending = 'Pending',
  Active = 'Active',
}

export interface UserPermissionsType {
  userTableValue?: string;
  role?: Roles;
  canManageWdfClaims?: boolean;
  permissionsQuestionValue?: string;
  isPrimary?: boolean;
}
