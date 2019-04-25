import { LocationAddress } from '@core/model/location.model';
import { UserDetails } from '@core/model/userDetails.model';

export interface RegistrationPayload extends LocationAddress {
  user: UserDetails;
}
