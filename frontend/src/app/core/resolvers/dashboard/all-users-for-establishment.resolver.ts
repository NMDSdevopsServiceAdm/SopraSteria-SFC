import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AllUsersForEstablishmentResolver implements Resolve<any> {
  constructor(
    private userService: UserService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private router: Router,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Array<UserDetails> | null> {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (!this.permissionsService.can(workplaceUid, 'canViewListOfUsers')) return of(null);

    return this.userService.getAllUsersForEstablishment(workplaceUid).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
