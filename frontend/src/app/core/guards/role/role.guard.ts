import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard  {
  constructor(private userService: UserService, private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const allowedRoles = route.data.roles as Array<string>;

    return this.userService.getLoggedInUser().pipe(
      map((user) => allowedRoles.includes(user.role) && allowedRoles.includes(this.authService.userInfo().role)),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(false);
      }),
    );
  }
}
