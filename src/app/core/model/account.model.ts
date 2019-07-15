export interface AccountDetails {
  label: string;
  data: string;
  route: string;
}

export interface CreateAccountRequest {
  email: string;
  fullname: string;
  jobTitle: string;
  phone: string;
  role: string;
}
