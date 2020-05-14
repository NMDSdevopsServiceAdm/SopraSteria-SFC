import { AuthService } from '@core/services/auth.service';

export class MockAuthService extends AuthService {
  public getPreviousToken(): any {
    return {};
  }
}
