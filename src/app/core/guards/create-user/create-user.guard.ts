import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { ValidateAccountActivationTokenRequest, ValidateAccountActivationTokenResponse } from '@core/model/account.model';

@Injectable({
  providedIn: 'root',
})
export class CreateUserGuard implements CanActivate {
  private validToken: boolean;
  constructor(private createAccountService: CreateAccountService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requestPayload: ValidateAccountActivationTokenRequest = {
      uuid: route.params.activationToken
    };

    this.createAccountService.validateAccountActivationToken(requestPayload)
      .pipe(take(1))
      .subscribe((response: ValidateAccountActivationTokenResponse) => {
        this.createAccountService.userDetails$.next(response);
        this.validToken = true;
      });

    if (this.validToken) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
