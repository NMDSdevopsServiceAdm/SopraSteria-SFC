export interface AddWorkplaceRequest {
  addressLine1: string;
  addressLine2: string;
  county: string;
  isRegulated: boolean;
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
