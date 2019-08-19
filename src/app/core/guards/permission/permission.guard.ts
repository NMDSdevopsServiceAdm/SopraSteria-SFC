import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
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
      map(userPermissions => this.hasInvalidPermissions(requiredPermissions, userPermissions)),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }

  private hasInvalidPermissions(requiredPermissions: string[], userPermissions: { [key: string]: boolean }): boolean {
    const permissions = [];
    Object.entries(userPermissions).forEach(item => {
      if (item[1]) {
        permissions.push(item[0]);
      }
    });
    return requiredPermissions.every(item => permissions.includes(item));
  }
}
