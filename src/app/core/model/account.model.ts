export interface CreateAccountRequest {
  email: string;
  fullname: string;
  jobTitle: string;
  phone: string;
  role: string;
}

export interface ActivateAccountRequest {
  email: string;
  fullname: string;
  jobTitle: string;
  password: string;
  phone: string;
  securityQuestion: string;
  securityQuestionAnswer: string;
  username: string;
}
