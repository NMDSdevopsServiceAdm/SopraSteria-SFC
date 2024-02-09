import { Roles } from '@core/model/roles.enum';

export interface CreateAccountRequest {
  email: string;
  fullname: string;
  jobTitle: string;
  phone: string;
  role: Roles;
  canManageWdfClaims?: boolean;
}

export interface CreateAccountResponse {
  uid: string;
  establishmentId: number;
  establishmentUid: string;
  message: string;
  nmdsId: string;
  status: number;
}

export interface ActivateAccountRequest {
  addUserUUID: string;
  email: string;
  fullname: string;
  jobTitle: string;
  password: string;
  phone: string;
  securityQuestion: string;
  securityQuestionAnswer: string;
  username: string;
}

export interface ValidateAccountActivationTokenRequest {
  uuid: string;
}

export interface ValidateAccountActivationTokenResponse {
  email: string;
  fullname: string;
  jobTitle: string;
  phone: string;
}
