import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { PermissionsList } from '@core/model/permissions.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class WorkplacePermissionsResolver implements Resolve<any> {
  constructor(private permissionsService: PermissionsService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid: string = route.paramMap.get('establishmentuid');
    const cachedPermissions: PermissionsList = this.permissionsService.permissions(workplaceUid);

    if (cachedPermissions) {
      return cachedPermissions;
    } else {
      return this.permissionsService
        .getPermissions(workplaceUid)
        .pipe(tap(response => this.permissionsService.setPermissions(workplaceUid, response.permissions)))
        .pipe(
          catchError(() => {
            return of(null);
          })
        );
    }
  }
}
