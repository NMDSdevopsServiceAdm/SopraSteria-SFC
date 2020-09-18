import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { CreateAccountService } from '@core/services/create-account/create-account.service';

@Injectable({
  providedIn: 'root',
})
export class ActivationCompleteGuard implements CanActivateChild {
  constructor(private createAccountService: CreateAccountService, private router: Router) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.createAccountService.activationComplete$.value) {
      return true;
    } else {
      this.router.navigate(['/activate-account', 'expired-activation-link']);
      return false;
    }
  }
}
