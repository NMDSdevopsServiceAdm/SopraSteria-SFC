import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Permissions, PermissionsList, PermissionsResponse, PermissionType } from '@core/model/permissions.model';
import { Roles } from '@core/model/roles.enum';
import { UserService } from '@core/services/user.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private _permissions$ = new BehaviorSubject<Permissions>({});

  constructor(private http: HttpClient, private router: Router, private userService: UserService) {}

  public getPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    return this.http.get<PermissionsResponse>(`/api/establishment/${workplaceUid}/permissions`);
  }

  public clearPermissions() {
    this._permissions$.next({});
  }

  public permissions(workplaceUid: string): PermissionsList {
    return this._permissions$.value[workplaceUid];
  }

  public setPermissions(workplaceUid: string, permissions: PermissionsList) {
    const subsidiaryPermissions: Permissions = this._permissions$.value;
    subsidiaryPermissions[workplaceUid] = permissions;
    this._permissions$.next(subsidiaryPermissions);
  }

  public can(workplaceUid: string, permissionType: PermissionType): boolean {
    if (this.userService.loggedInUser && this.userService.loggedInUser.role === Roles.Admin) {
      return true;
    }

    const permissions = this.permissions(workplaceUid);
    return permissions.hasOwnProperty(permissionType) && permissions[permissionType] ? true : false;
  }

  public handlePermissionsCheck(requiredPermissions: string[], permissionsList: PermissionsList): boolean {
    if (!this.hasValidPermissions(requiredPermissions, permissionsList)) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    requiredPermissions.forEach(item => {
      if (!permissionsList[item]) {
        this.router.navigate(['/dashboard']);
      }
    });
    return true;
  }

  public hasWorkplacePermissions(workplaceUid: string) {
    const cachedPermissions: PermissionsList = this.permissions(workplaceUid);
    if (cachedPermissions) {
      return of(true);
    }

    // TODO remove once user resolver is replaced by extra check in has permissions guard
    if (!workplaceUid) {
      return of(true);
    }

    return this.getPermissions(workplaceUid)
      .pipe(tap(response => this.setPermissions(workplaceUid, response.permissions)))
      .pipe(
        catchError(() => {
          return of(null);
        })
      )
      .pipe(map(() => true));
  }

  private hasValidPermissions(requiredPermissions: string[], permissionsList: PermissionsList): boolean {
    if (!permissionsList) {
      return false;
    }
    const userPermissions: string[] = Object.keys(permissionsList);
    return requiredPermissions.every(item => userPermissions.includes(item));
  }
}
