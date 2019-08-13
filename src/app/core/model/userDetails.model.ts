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
  migratedUser?: boolean;
  migratedUserFirstLogon?: boolean;
  phone: string;
  role?: Roles;
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
