export interface Registrations {
  [index: number]: {
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
      mainService: number;
    };
  };
}
