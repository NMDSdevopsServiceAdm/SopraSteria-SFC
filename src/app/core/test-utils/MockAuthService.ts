import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockAuthService extends AuthService {
  private _isAuthenticated = false;
  private _isAdmin = false;

  public static factory(isAuthenticated = false, isAdmin = false) {
    return (
      httpClient: HttpClient,
      router: Router,
      establishmentService: EstablishmentService,
      userService: UserService,
      permissionsService: PermissionsService,
      featureFlagsService: FeatureFlagsService,
    ) => {
      const service = new MockAuthService(
        httpClient,
        router,
        establishmentService,
        userService,
        permissionsService,
        featureFlagsService,
      );
      service._isAuthenticated = isAuthenticated;
      service._isAdmin = isAdmin;
      return service;
    };
  }

  constructor(
    http: HttpClient,
    router: Router,
    establishmentService: EstablishmentService,
    userService: UserService,
    permissionsService: PermissionsService,
    featureFlagsService: FeatureFlagsService,
  ) {
    super(http, router, establishmentService, userService, permissionsService, featureFlagsService);
  }

  public getPreviousToken(): any {
    return {};
  }

  public isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  protected unauthenticate(): void {
    // do nothing.
  }

  protected setPreviousUser(): void {
    // do nothing.
  }

  public logoutWithoutRouting(): void {
    // do nothing.
  }

  public get isAdmin(): boolean {
    return this._isAdmin;
  }

  public get token() {
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    .eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4
    gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeK
    KF2QT4fwpMeJf36POk6yJV_adQssw5c`;
  }

  public authenticate(username: string, password: string): Observable<any> {
    return of({
      body: {
        role: this._isAdmin ? 'Admin' : 'Edit',
        agreedUpdatedTerms: true,
      },
    });
  }
}
