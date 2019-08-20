import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { PermissionsResponse } from '@core/model/permissions.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class WorkplacePermissionsResolver implements Resolve<any> {
  constructor(private permissionsService: PermissionsService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const establishmentUid: string = route.paramMap.get('establishmentuid');
    const cachedPermissions: PermissionsResponse | null = this.permissionsService.filterPermissions(establishmentUid);

    if (cachedPermissions) {
      return cachedPermissions;
    } else {
      return this.permissionsService
        .getPermissions(establishmentUid)
        .pipe(tap(response => this.permissionsService.setPermissions(response)))
        .pipe(
          catchError(() => {
            return of(null);
          })
        );
    }
  }
}
