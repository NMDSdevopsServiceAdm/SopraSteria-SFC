import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { PermissionsList } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Injectable({
  providedIn: 'root',
})
export class WorkplacePermissionGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermissions = route.data['permissions'] as Array<string>;
    const workplaceUid = this.establishmentService.establishmentId;
    const permissions = this.permissionsService.permissions(workplaceUid);

    if (!this.hasValidPermissions(requiredPermissions, permissions)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

  private hasValidPermissions(requiredPermissions: string[], permissionsList: PermissionsList): boolean {
    if (!permissionsList) {
      return false;
    }
    const userPermissions: string[] = Object.keys(permissionsList);
    return requiredPermissions.every(item =>  userPermissions.includes(item));
  }
}
