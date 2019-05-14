import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { LoggedInSession } from '@core/model/logged-in.model';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private role: string;

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const allowedRoles = route.data['roles'] as Array<string>;

    this.authService.auth$
      .pipe(take(1))
      .subscribe((loggedInSession: LoggedInSession) => (this.role = loggedInSession.role));

    if (allowedRoles.includes(this.role)) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
