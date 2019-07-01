export interface GetWorkplacesResponse {
  primary: Workplace;
  subsidaries?: {
    count: number;
    establishments: Workplace[];
  };
}

export interface Workplace {
  dataOwner: WorkplaceDataOwner;
  mainService: string;
  name: string;
  parentPermissions: ParentPermissions;
  parentUid: string;
  uid: string;
  updated: string;
}

export enum WorkplaceDataOwner {
  Parent = 'Parent',
}

export enum ParentPermissions {
  Workplace = 'Workplace',
  WorkplaceAndStaff = 'Workplace and Staff',
}
