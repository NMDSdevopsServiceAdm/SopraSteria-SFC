import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  private checkLogin(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isLoggedIn) {
      return true;
    }

    if (this.establishmentService.isSameLoggedInUser) {
      this.authService.redirect = { url: route.url, fragment: route.fragment, queryParams: route.queryParams };
    }
    this.router.navigate(['/login']);
    return false;
  }
}
