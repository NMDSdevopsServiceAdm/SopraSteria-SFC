import { Location } from '@core/model/location.model';

export interface RegistrationModel {
  success: number;
  message: string;
  detailsChanged: boolean;
  userRoute: {
    currentPage: number;
    route: [];
  };
  locationdata: Array<Location>;
  postcodedata: [{
    locationName: string;
    addressLine1: string;
    addressLine2: string;
    townCity: string;
    county: string;
    postalCode: string;
  }];
}
