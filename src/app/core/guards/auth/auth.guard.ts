import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private authService: AuthService, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin(state);
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(next, state);
  }

  private checkLogin(state: RouterStateSnapshot): boolean {
    if (!this.authService.token) {
      this.authService.logoutWithoutRouting();
      this.router.navigate(['/login']);
      return false;
    }

    if (!this.authService.isAuthenticated()) {
      this.authService.storeRedirectLocation();
      this.authService.logout();
      return false;
    }

    return true;
  }
}
