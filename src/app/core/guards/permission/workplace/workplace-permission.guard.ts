import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { PermissionsList } from '@core/model/permissions.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WorkplacePermissionGuard implements CanActivate {
  constructor(private permissionsService: PermissionsService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requiredPermissions: string[] = route.data['permissions'] as Array<string>;
    const workplaceUid: string = route.paramMap.get('establishmentuid');
    const cachedPermissions: PermissionsList = this.permissionsService.permissions(workplaceUid);
    // console.log('requiredPermissions', requiredPermissions);
    // console.log('workplaceUid', workplaceUid);
    if (cachedPermissions) {
      console.log('cachedPermissions', cachedPermissions);
    } else {
      console.warn('NO cachedPermissions');
    }

    if (cachedPermissions) {
      return of(this.handlePermissionsCheck(requiredPermissions, cachedPermissions));
    } else {
      // TODO make api call
      console.warn('make api call');

      return this.permissionsService
        .getPermissions(workplaceUid)
        .pipe(tap(response => this.permissionsService.setPermissions(workplaceUid, response.permissions)))
        .pipe(map(response => this.handlePermissionsCheck(requiredPermissions, response.permissions)));
    }
  }

  private handlePermissionsCheck(requiredPermissions: string[], cachedPermissions: PermissionsList): boolean {
    if (!this.hasValidPermissions(requiredPermissions, cachedPermissions)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

  // TODO move to service
  private hasValidPermissions(requiredPermissions: string[], permissionsList: PermissionsList): boolean {
    if (!permissionsList) {
      return false;
    }
    const userPermissions: string[] = Object.keys(permissionsList);
    return requiredPermissions.every(item => userPermissions.includes(item));
  }
}
