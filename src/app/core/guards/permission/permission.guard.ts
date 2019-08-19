import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Permissions } from '@core/model/permissions.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(private permissionsService: PermissionsService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requiredPermissions = route.data['permissions'] as Array<string>;

    return this.permissionsService.permissions$.pipe(
      map(userPermissions => this.hasValidPermissions(requiredPermissions, userPermissions)),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }

  private hasValidPermissions(requiredPermissions: string[], userPermissions: Permissions) {
    return requiredPermissions.every(item => Object.keys(userPermissions).includes(item));
  }
}
