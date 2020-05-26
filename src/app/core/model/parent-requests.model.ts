export interface ParentRequests {
  [index: number]: {
    requestId: number;
    requestUUID: string;
    establishmentId: number;
    establishmentUid:string;
    userId: number;
    workplaceId: string;
    userName: string;
    orgName: string;
    requested: Date;
  };
}
