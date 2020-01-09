export interface AddWorkplaceRequest {
  addressLine1: string;
  addressLine2: string;
  addressLine3?: string;
  county: string;
  isRegulated: boolean;
  locationId: string;
  locationName: string;
  mainService: string;
  postalCode: string;
  townCity: string;
}

export interface AddWorkplaceResponse {
  establishmentId: number;
  establishmentUid: string;
  message: string;
  nmdsId: string;
  status: number;
}

export enum AddWorkplaceFlow {
  CQC_WITH_USER = 'CQC with user',
  CQC_NO_USER = 'CQC no user',
  NON_CQC = 'non cqc',
}
