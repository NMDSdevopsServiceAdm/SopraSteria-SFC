export interface CreateAccountRequest {
  email: string;
  fullname: string;
  jobTitle: string;
  phone: string;
  role: string;
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
