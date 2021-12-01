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
  uid?: string;
  updated?: string;
  updatedBy?: string;
  username?: string;
}

export enum UserStatus {
  Pending = 'Pending',
  Active = 'Active',
}

export interface UserSearchRequest {
  username: string;
  name: string;
  emailAddress: string;
}

export interface UserSearchItem {
  uid: string;
  name: string;
  username: string;
  securityQuestion: string;
  securityQuestionAnswer: string;
  isLocked: boolean;
  email?: string;
  invalidAttempt?: number;
  isPrimary?: boolean;
  lastLoggedIn?: string;
  passwdLastChanged?: string;
  phone?: string;
  establishment: {
    uid: string;
    name: string;
    nmdsId: string;
    postcode: string;
    address?: string;
    isParent?: false;
    isRegulated?: false;
    locationId?: string;
    parent?: {
      name?: string;
      nmdsId?: string;
      postcode?: string;
    };
    ustatus?: string;
  };
}
