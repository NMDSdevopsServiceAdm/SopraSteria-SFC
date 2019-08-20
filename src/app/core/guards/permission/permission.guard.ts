import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { PermissionsList } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requiredPermissions = route.data['permissions'] as Array<string>;
    const workplaceUid = this.establishmentService.establishmentId;

    return this.permissionsService.permissions$.pipe(
      map(() => this.hasValidPermissions(requiredPermissions, this.permissionsService.getPermissions(workplaceUid))),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }

  private hasValidPermissions(requiredPermissions: string[], permissionsList: PermissionsList): boolean {
    const userPermissions: string[] = Object.keys(permissionsList);
    return requiredPermissions.every(item =>  userPermissions.includes(item));
  }
}
