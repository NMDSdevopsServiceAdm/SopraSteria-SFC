import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private jwt = new JwtHelperService();

  constructor(private router: Router, private authService: AuthService, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkLogin(state);
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.canActivate(next, state);
  }

  private checkLogin(state: RouterStateSnapshot): boolean | UrlTree {
    if (this.authService.token) {
      console.log('Checking token in auth guard');
      if (this.jwt.isTokenExpired(this.authService.token)) {
        this.authService.logout();
        return this.router.createUrlTree(['/logged-out']);
      }
    }

    if (!this.authService.token) {
      this.authService.logoutWithoutRouting();
      return this.router.createUrlTree(['/login']);
    }

    if (!this.authService.isAuthenticated()) {
      this.authService.storeRedirectLocation();
      this.authService.logoutWithoutRouting();
      return this.router.createUrlTree(['/logged-out']);
    }

    if (!this.userService.agreedUpdatedTerms) {
      if (state.url !== '/migrated-user-terms-and-conditions') {
        return this.router.createUrlTree(['/migrated-user-terms-and-conditions']);
      }
    }

    return true;
  }
}
