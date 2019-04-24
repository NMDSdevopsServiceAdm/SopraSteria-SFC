import { LocationAddress } from '@core/model/location-address.model';
import { UserDetails } from '@core/model/userDetails.model';

export interface RegistrationModel {
  success: number;
  message: string;
  // TODO to remove
  userRoute: {
    currentPage: number;
    route: [];
  };
  locationdata: Array<LocationAddress>;
  postcodedata: Array<LocationAddress>;
}

export interface RegistrationPayload extends LocationAddress {
  user: UserDetails;
}
