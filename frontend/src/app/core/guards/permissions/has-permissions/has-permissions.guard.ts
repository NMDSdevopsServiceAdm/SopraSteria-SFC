import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HasPermissionsGuard  {
  constructor(
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
    private userService: UserService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const notPrimaryWorkplace: string = route.paramMap.get('establishmentuid');
    const workplaceUid: string = notPrimaryWorkplace ? notPrimaryWorkplace : this.establishmentService.establishmentId;

    return this.permissionsService.hasWorkplacePermissions(workplaceUid);
  }
}
