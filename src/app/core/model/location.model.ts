export interface LocationAddress {
  addressLine1: string;
  addressLine2: string;
  county: string;
  isRegulated?: boolean;
  locationId?: string;
  locationName: string;
  mainService?: string;
  postalCode: string;
  townCity: string;
}

export interface LocationSearchResponse {
  success: number;
  message: string;
  locationdata?: Array<LocationAddress>;
  postcodedata?: Array<LocationAddress>;
}
