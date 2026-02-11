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
  userResearchInviteAccepted?: boolean;
  status?: UserStatus;
  password?: string;
  uid?: string;
  updated?: string;
  updatedBy?: string;
  username?: string;
  lastViewedVacanciesAndTurnoverMessage?: string;
  trainingCoursesMessageViewedQuantity?: number;
}

export enum UserStatus {
  Pending = 'Pending',
  Active = 'Active',
}

export interface UserPermissionsType {
  userTableValue?: string;
  role?: Roles;
  permissionsQuestionValue?: string;
  isPrimary?: boolean;
}
