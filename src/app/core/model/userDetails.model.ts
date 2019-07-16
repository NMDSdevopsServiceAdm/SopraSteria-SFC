export interface UserDetails {
  created?: string;
  email: string;
  fullname: string;
  jobTitle: string;
  phone: string;
  role?: string;
  securityQuestion?: string;
  securityQuestionAnswer?: string;
  uid?: string;
  updated?: string;
  updatedBy?: string;
  username?: string;
  status?: 'Pending' | 'Active';
}
