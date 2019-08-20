import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class PrimaryWorkplacePermissionsResolver implements Resolve<any> {
  constructor(private permissionsService: PermissionsService, private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = this.establishmentService.establishmentId;
    if (workplaceUid) {
      return this.permissionsService
        .getPermissions(workplaceUid)
        .pipe(tap(response => this.permissionsService.setPermissions(response)))
        .pipe(
          catchError(() => {
            return of(null);
          })
        );
    }
  }
}
