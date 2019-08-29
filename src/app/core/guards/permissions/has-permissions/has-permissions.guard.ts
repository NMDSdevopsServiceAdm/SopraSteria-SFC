import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { PermissionsList } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HasPermissionsGuard implements CanActivate {
  constructor(private permissionsService: PermissionsService, private establishmentService: EstablishmentService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const notPrimaryWorkplace: string = route.paramMap.get('establishmentuid');
    const workplaceUid: string = notPrimaryWorkplace ? notPrimaryWorkplace : this.establishmentService.establishmentId;

    if (!workplaceUid) {
      return of(true);
    }

    const cachedPermissions: PermissionsList = this.permissionsService.permissions(workplaceUid);

    if (cachedPermissions) {
      return of(true);
    } else {
      return this.permissionsService
        .getPermissions(workplaceUid)
        .pipe(tap(response => this.permissionsService.setPermissions(workplaceUid, response.permissions)))
        .pipe(
          catchError(() => {
            return of(null);
          })
        )
        .pipe(map(() => true));
    }
  }
}
