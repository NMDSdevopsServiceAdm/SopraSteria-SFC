export interface MyWorkplacesResponse {
  primary: {
    dataOwner: string;
    isParent: boolean,
    mainService: string;
    name: string;
    parentUid: string,
    uid: string;
    updated: string;
  };
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
