import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import {
  ValidateAccountActivationTokenRequest,
  ValidateAccountActivationTokenResponse,
} from '@core/model/account.model';
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
      map((response: ValidateAccountActivationTokenResponse) => {
        this.createAccountService.userDetails$.next(response);
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }
}
