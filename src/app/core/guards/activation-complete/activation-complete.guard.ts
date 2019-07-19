import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CreateAccountService } from '@core/services/create-account/create-account.service';

@Injectable({
  providedIn: 'root',
})
export class ActivationCompleteGuard implements CanActivate {
  constructor(
    private createAccountService: CreateAccountService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.createAccountService.activationComplete$.value) {
      return true;
    } else {
      this.router.navigate(['/activate-account', 'expired-activation-link']);
      return false;
    }
  }
}
