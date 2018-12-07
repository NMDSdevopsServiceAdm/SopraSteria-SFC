// Model for Location Api
export interface LocationApiModel {
  success: number;
  message: string;
  locationdata: {
    locationId: string;
    locationName: string;
    addressLine1: string;
    addressLine2: string;
    townCity: string;
    county: string;
    postalCode: string;
    mainService: string;
    isRegulated: boolean;
  };
}

