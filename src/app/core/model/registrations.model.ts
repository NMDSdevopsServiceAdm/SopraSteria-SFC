export interface Registrations {
  [index: number]: Registration;
}
export interface Registration {
  name: string;
  username: string;
  securityQuestion: string;
  securityQuestionAnswer: string;
  email: string;
  phone: string;
  created: string;
  establishment: {
    name: string;
    isRegulated: boolean;
    nmdsId: string;
    address: string;
    address2: string;
    address3: string;
    postcode: string;
    town: string;
    county: string;
    locationId: string;
    provid: string;
    parentId: string;
    parentUid: string;
    mainService: number;
    status: string;
    uid: string;
  };
}

export interface UpdateWorkplaceIdRequest {
  uid: string;
  nmdsId: string;
}
