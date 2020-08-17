import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { IdleService } from '@core/services/idle.service';
import { UserService } from '@core/services/user.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Injectable()
export class MockAuthService extends AuthService {
  private _isAuthenticated = false;

  public static factory(isAuthenticated = false) {
    return (httpClient: HttpClient,
            router: Router,
            establishmentService: EstablishmentService,
            userService: UserService,
            permissionsService: PermissionsService) => {
      const service = new MockAuthService(httpClient, router, establishmentService, userService, permissionsService);
      service._isAuthenticated = isAuthenticated;
      return service;
    };
  }

  public getPreviousToken(): any {
    return {};
  }

  public isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
}
