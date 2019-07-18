import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ValidateAccountActivationTokenRequest } from '@core/model/account.model';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CreateUserGuard implements CanActivate {
  constructor(private createAccountService: CreateAccountService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requestPayload: ValidateAccountActivationTokenRequest = {
      uuid: route.params.activationToken
    };

    // TODO there is a BE bug with this api so this is WIP
    this.createAccountService.validateAccountActivationToken(requestPayload)
      .pipe(take(1))
      .subscribe((response: any) => console.log(response));

    return true;

    this.router.navigate(['/dashboard']);
    return false;
  }
}
