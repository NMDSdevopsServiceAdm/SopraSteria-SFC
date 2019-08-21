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

    if (cachedPermissions) {
      return of(this.handlePermissionsCheck(requiredPermissions, cachedPermissions));
    } else {
      return this.permissionsService
        .getPermissions(workplaceUid)
        .pipe(tap(response => this.permissionsService.setPermissions(workplaceUid, response.permissions)))
        .pipe(
          catchError(() => {
            return of(null);
          })
        )
        .pipe(map(response => this.handlePermissionsCheck(requiredPermissions, response.permissions)));
    }
  }

  private handlePermissionsCheck(requiredPermissions: string[], cachedPermissions: PermissionsList): boolean {
    if (!this.permissionsService.hasValidPermissions(requiredPermissions, cachedPermissions)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
