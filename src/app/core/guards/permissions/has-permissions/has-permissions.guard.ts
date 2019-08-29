import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HasPermissionsGuard implements CanActivate {
  constructor(private permissionsService: PermissionsService, private establishmentService: EstablishmentService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const notPrimaryWorkplace: string = route.paramMap.get('establishmentuid');
    const workplaceUid: string = notPrimaryWorkplace ? notPrimaryWorkplace : this.establishmentService.establishmentId;

    if (!workplaceUid) {
      return of(false);
    }

    return this.permissionsService.hasWorkplacePermissions(workplaceUid);
  }
}
