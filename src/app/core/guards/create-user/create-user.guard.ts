import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ValidateAccountActivationTokenRequest } from '@core/model/account.model';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CreateUserGuard implements CanActivate {
  constructor(private createAccountService: CreateAccountService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requestPayload: ValidateAccountActivationTokenRequest = {
      uuid: route.params.activationToken,
    };

    return this.createAccountService.validateAccountActivationToken(requestPayload).pipe(
      map(response => {
        this.createAccountService.userDetails$.next(response.body);
        this.createAccountService.token = response.headers.get('authorization');

        return true;
      }),
      catchError(() => {
        this.router.navigate(['/activate-account', 'expired-activation-link']);

        return of(false);
      })
    );
  }
}
