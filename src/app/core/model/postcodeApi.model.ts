// Model for Postcode Api
export interface PostCodeApiModel {
  success: number;
  message: string;
  postcodedata: {
    locationName: string,
    addressLine1: string,
    addressLine2: string,
    townCity: string,
    postalCode: string,
  };
}

