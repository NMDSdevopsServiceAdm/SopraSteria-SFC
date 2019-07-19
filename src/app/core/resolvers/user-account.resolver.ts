import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UserAccountResolver implements Resolve<any> {
  constructor(private router: Router, private userService: UserService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const establishmentUid = route.paramMap.get('establishmentuid');
    const userUid = route.paramMap.get('useruid');

    return this.userService.getUserDetails(establishmentUid, userUid).pipe(
      catchError(() => {
        this.router.navigate(['/workplace', establishmentUid], { fragment: 'user-accounts' });
        return of(null);
      })
    );
  }
}
