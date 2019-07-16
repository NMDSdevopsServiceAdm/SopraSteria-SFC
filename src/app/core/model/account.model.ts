export interface PartialCreateAccountRequest {
  email: string;
  fullname: string;
  jobTitle: string;
  phone: string;
  role: string;
}

export interface CompleteCreateAccountRequest {
  email: string;
  fullname: string;
  jobTitle: string;
  password: string;
  phone: string;
  securityQuestion: string;
  securityQuestionAnswer: string;
  username: string;
}
