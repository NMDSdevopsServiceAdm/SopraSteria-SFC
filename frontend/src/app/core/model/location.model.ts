import { EmployerType } from './establishment.model';

export interface LocationAddress {
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  county: string;
  isRegulated?: boolean;
  locationId?: string;
  locationName: string;
  mainService?: string;
  mainServiceOther?: string;
  postalCode: string;
  townCity: string;
  numberOfStaff?: string;
  typeOfEmployer?: EmployerType;
}

export interface LocationSearchResponse {
  locationdata?: Array<LocationAddress>;
  message: string;
  postcodedata?: Array<LocationAddress>;
  success: number;
  searchmethod: string;
}
