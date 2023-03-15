import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { CreateAccountService } from '@core/services/create-account/create-account.service';

@Injectable({
  providedIn: 'root',
})
export class ActivationCompleteWithOutChildGuard implements CanActivate {
  constructor(private createAccountService: CreateAccountService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.createAccountService.activationComplete$.subscribe((res) => {
        if (res) {
          return resolve(true);
        }
        this.router.navigate(['/activate-account', 'expired-activation-link']);
        return resolve(false);
      });
    });
  }
}
