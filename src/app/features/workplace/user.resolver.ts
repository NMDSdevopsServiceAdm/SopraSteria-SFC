import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UserResolver implements Resolve<any> {
  constructor(private router: Router, private userService: UserService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.userService
      .getUserDetails(route.paramMap.get('useruid'), route.parent.paramMap.get('establishmentuid'))
      .pipe(
        catchError(() => {
          this.router.navigate(['/dashboard'], { fragment: 'user-accounts' });
          return of(null);
        })
      );
  }
}
