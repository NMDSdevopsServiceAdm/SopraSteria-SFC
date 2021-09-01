import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Roles } from '@core/model/roles.enum';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';

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
    if (this.userService.loggedInUser && this.userService.loggedInUser.role === Roles.Admin) {
      return true;
    }

    const requiredPermissions = route.data.permissions as Array<string>;
    const notPrimaryWorkplace: string = route.paramMap.get('establishmentuid');
    const workplaceUid: string = notPrimaryWorkplace ? notPrimaryWorkplace : this.establishmentService.establishmentId;
    const permissions = this.permissionsService.permissions(workplaceUid);

    return this.permissionsService.handlePermissionsCheck(requiredPermissions, permissions);
  }
}
