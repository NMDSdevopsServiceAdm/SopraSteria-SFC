import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { catchError, map } from 'rxjs/operators';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ValidateAccountActivationTokenRequest } from '@core/model/account.model';

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

    return this.createAccountService.validateAccountActivationToken(requestPayload).pipe(
      map(
        response => {
          this.createAccountService.userDetails$.next(response.body);
          const token = response.headers.get('authorization');
          this.authService.authorise(token);
          return true;
        },
        catchError(() => {
          this.router.navigate(['/dashboard']);
          return of(false);
        })
      )
    );
  }
}
