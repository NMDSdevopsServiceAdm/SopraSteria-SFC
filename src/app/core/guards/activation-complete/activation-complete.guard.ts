import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { CreateAccountService } from '@core/services/create-account/create-account.service';

@Injectable({
  providedIn: 'root',
})
export class ActivationCompleteGuard implements CanActivateChild {
  constructor(private createAccountService: CreateAccountService, private router: Router) {}

  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const allowed = await this.canActivate();

      if (!allowed) {
        this.router.navigate(['/activate-account', 'expired-activation-link']);
        return false;
      }
      return allowed;
    } catch (error) {
      this.router.navigate(['/activate-account', 'expired-activation-link']);
      return false;
    }
  }

  private async canActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.createAccountService.activationComplete$.subscribe((res) => {
        if (res) {
          return resolve(true);
        }
        return resolve(false);
      });
    });
  }
}
