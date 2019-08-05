import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ValidateAccountActivationTokenRequest } from '@core/model/account.model';
import { AuthService } from '@core/services/auth.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CreateUserGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private createAccountService: CreateAccountService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requestPayload: ValidateAccountActivationTokenRequest = {
      uuid: route.params.activationToken,
    };

    // Clear localstorage, session and auth token in case user is already logged in
    this.authService.logoutWithoutRouting();

    return this.createAccountService.validateAccountActivationToken(requestPayload).pipe(
      map(response => {
        this.createAccountService.userDetails$.next(response.body);
        const token = response.headers.get('authorization');
        this.createAccountService.token = token;
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/activate-account', 'expired-activation-link']);
        return of(false);
      })
    );
  }
}
