import { UserService } from '@core/services/user.service';
import { UserDetails } from '@core/model/userDetails.model';

export class MockUserService extends UserService {
  public get loggedInUser(): UserDetails {
    return {
      email: '', fullname: '', jobTitle: '', phone: ''
    };
  }
}
