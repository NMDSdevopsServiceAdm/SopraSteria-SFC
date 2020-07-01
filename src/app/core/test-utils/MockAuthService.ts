import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Injectable()
export class MockAuthService extends AuthService {
  public getPreviousToken(): any {
    return {};
  }
}
