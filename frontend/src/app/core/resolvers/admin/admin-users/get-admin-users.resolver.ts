import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetAdminUsersResolver  {
  constructor(private router: Router, private adminUsersService: AdminUsersService) {}

  resolve(): Observable<UserDetails[]> {
    return this.adminUsersService.getAdminUsers().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
