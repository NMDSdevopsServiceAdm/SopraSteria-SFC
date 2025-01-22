export interface GetWorkplacesResponse {
  primary: Workplace;
  subsidaries?: {
    count: number;
    establishments: Workplace[];
  };
}

export interface GetChildWorkplacesResponse {
  childWorkplaces: Workplace[];
  count: number;
  activeWorkplaceCount: number;
  showFlag: boolean;
}

export interface Workplace {
  dataOwner: WorkplaceDataOwner;
  dataPermissions: DataPermissions;
  dataOwnerPermissions: string;
  isParent?: boolean;
  localIdentifier?: string;
  mainService: string;
  name: string;
  parentUid?: string;
  uid: string;
  updated: string;
  ownershipChangeRequestId?: any;
  parentName?: string;
  ustatus?: string;
  linkToParentRequested?: string;
  postCode?: string;
  showFlag?: boolean;
  nameAndPostCode?: string;
  id?: number;
  wdf?: {
    overall: boolean;
  };
}

export enum WorkplaceDataOwner {
  Parent = 'Parent',
  Workplace = 'Workplace',
}

export enum DataPermissions {
  Workplace = 'Workplace',
  WorkplaceAndStaff = 'Workplace and Staff',
  None = 'None',
}

export interface WorkPlaceReference {
  name: string;
  uid: string;
}

export enum RejectOptions {
  NO = 'No, continue without providing a reason',
  YES = 'Yes, provide reason',
}
