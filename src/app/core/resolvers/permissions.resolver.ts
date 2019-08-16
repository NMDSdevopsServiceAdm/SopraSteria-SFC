import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class PermissionsResolver implements Resolve<any> {
  constructor(private permissionsService: PermissionsService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = localStorage.getItem('establishmentId');
    if (workplaceUid) {
      return this.permissionsService.getPermissions(workplaceUid).pipe(
        catchError(() => {
          return of(null);
        })
      );
    }
  }
}
