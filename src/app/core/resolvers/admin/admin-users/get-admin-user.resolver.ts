import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetAdminUserResolver implements Resolve<any> {
  constructor(private router: Router, private adminUserService: AdminUsersService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<UserDetails> {
    const userUid = route.paramMap.get('useruid');
    return this.adminUserService.getAdminUser(userUid).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
