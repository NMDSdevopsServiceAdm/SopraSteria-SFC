export interface LocationAddress {
  addressLine1: string;
  addressLine2: string;
  addressLine3?: string;
  county: string;
  isRegulated?: boolean;
  locationId?: string;
  locationName: string;
  mainService?: string;
  mainServiceOther?: string;
  postalCode: string;
  townCity: string;
}

export interface LocationSearchResponse {
  locationdata?: Array<LocationAddress>;
  message: string;
  postcodedata?: Array<LocationAddress>;
  success: number;
}
