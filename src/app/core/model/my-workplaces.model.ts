export interface GetWorkplacesResponse {
  primary: Workplace;
  subsidaries?: {
    count: number;
    establishments: Workplace[];
  };
}

export interface Workplace {
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
