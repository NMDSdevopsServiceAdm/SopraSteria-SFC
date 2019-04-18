export interface WorkplaceLocation {
  addressLine1: string;
  addressLine2: string;
  county: string;
  isRegulated: boolean;
  locationId: string;
  locationName: string;
  mainService: string;
  postalCode: string;
  townCity: string;
  // TODO check if this user object can be moved
  user: {
    contactNumber: string;
    emailAddress: string;
    fullname: string;
    jobTitle: string;
    password: string;
    securityAnswer: string;
    securityQuestion: string;
    username: string;
  };
}

