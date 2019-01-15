import { Injectable } from '@angular/core'
import { CanActivate, CanLoad, Route, Router } from '@angular/router'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { AuthService } from "./auth-service"


@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin(state.url)
  }

  canLoad(route: Route): boolean {
    return this.checkLogin(`/${route.path}`)
  }

  private checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn) {
      return true
    }

    this.authService.redirectUrl = url
    this.router.navigate(["/login"])
    return false
  }
}
