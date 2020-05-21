export interface ParentRequests {
  [index: number]: {
    establishmentId: number;
    workplaceId: string;
    userName: string;
    orgName: string;
    requested: Date;
    /*user: {
      uid: number;
      name: string;
    };
    establishment: {
      uid: number;
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
    };*/
  };
}
