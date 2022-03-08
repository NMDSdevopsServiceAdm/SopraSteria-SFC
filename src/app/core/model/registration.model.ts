import { LocationAddress } from '@core/model/location.model';
import { UserDetails } from '@core/model/userDetails.model';

export interface RegistrationPayload {
  establishment: LocationAddress;
  user: UserDetails;
}
