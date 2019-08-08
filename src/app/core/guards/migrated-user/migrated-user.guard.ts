import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class MigratedUserGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkTermsAcceptance(state);
  }

  private checkTermsAcceptance(state: RouterStateSnapshot): boolean {
    if (this.userService.migratedUserTermsAccepted$.value) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
