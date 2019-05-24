export interface MyWorkplacesResponse {
  primary: MyWorkplace;
  subsidaries?: {
    count: number;
    establishments: Array<MyWorkplace>;
  };
}

export interface MyWorkplace {
  dataOwner: string;
  mainService: string;
  name: string;
  parentPermissions: string;
  parentUid: string;
  uid: string;
  updated: string;
}

export enum ParentPermissions {
  Workplace = 'Workplace',
  WorkplaceAndStaff = 'Workplace and Staff',
}
