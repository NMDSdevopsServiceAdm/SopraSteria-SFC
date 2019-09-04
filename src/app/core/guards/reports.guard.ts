import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Injectable({
  providedIn: 'root',
})
export class ReportsGuard implements CanActivate {
  constructor(private permissionsService: PermissionsService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const workplaceUid = route.paramMap.get('establishmentuid');
    return (
      this.permissionsService.can(workplaceUid, 'canViewWdfReport') ||
      this.permissionsService.can(workplaceUid, 'canRunLocalAuthorityReport')
    );
  }
}
