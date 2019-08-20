import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class WorkplacePermissionsResolver implements Resolve<any> {
  constructor(private permissionsService: PermissionsService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.permissionsService
      .getPermissions(route.paramMap.get('establishmentuid'))
      .pipe(tap(response => this.permissionsService.setPermissions(response)))
      .pipe(
        catchError(() => {
          return of(null);
        })
      );
  }
}
