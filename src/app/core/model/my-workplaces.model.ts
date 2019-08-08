export interface GetWorkplacesResponse {
  primary: Workplace;
  subsidaries?: {
    count: number;
    establishments: Workplace[];
  };
}

export interface Workplace {
  dataOwner: WorkplaceDataOwner;
  dataOwnerPermissions: string;
  isParent: boolean;
  localIdentifier: string;
  mainService: string;
  name: string;
  parentPermissions: ParentPermissions;
  parentUid: string;
  uid: string;
  updated: string;
}

export enum WorkplaceDataOwner {
  Parent = 'Parent',
  Workplace = 'Workplace',
}

export enum ParentPermissions {
  Workplace = 'Workplace',
  WorkplaceAndStaff = 'Workplace and Staff',
}

export interface WorkPlaceReference {
  name: string;
  uid: string;
}
