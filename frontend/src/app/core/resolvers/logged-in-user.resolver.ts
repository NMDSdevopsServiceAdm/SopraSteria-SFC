import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class LoggedInUserResolver  {
  constructor(private router: Router, private userService: UserService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.userService
      .getLoggedInUser()
      .pipe(
        catchError(() => {
          this.router.navigate(['/logged-out']);
          return of(null);
        })
      );
  }
}
