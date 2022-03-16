import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';

import { isAdminRole } from '../../../../../../server/utils/adminUtils';

@Injectable({
  providedIn: 'root',
})
export class CheckPermissionsGuard implements CanActivate {
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
