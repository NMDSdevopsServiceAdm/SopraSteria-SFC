import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { isAdminRole } from '@core/utils/check-role-util';

@Injectable({
  providedIn: 'root',
})
export class CheckPermissionsGuard  {
  constructor(
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
    private userService: UserService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.userService.loggedInUser && isAdminRole(this.userService.loggedInUser.role)) {
      return true;
    }

    const requiredPermissions = route.data.permissions as Array<PermissionType>;
    const notPrimaryWorkplace: string = route.paramMap.get('establishmentuid');
    const workplaceUid: string = notPrimaryWorkplace ? notPrimaryWorkplace : this.establishmentService.establishmentId;
    const permissions = this.permissionsService.permissions(workplaceUid);

    return this.permissionsService.handlePermissionsCheck(requiredPermissions, permissions);
  }
}
