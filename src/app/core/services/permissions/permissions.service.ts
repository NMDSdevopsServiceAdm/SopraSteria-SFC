import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Permissions, PermissionsList, PermissionsResponse, PermissionType } from '@core/model/permissions.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private _permissions$ = new BehaviorSubject<Permissions>({});

  constructor(private http: HttpClient, private router: Router) {}

  public getPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    return this.http.get<PermissionsResponse>(`/api/establishment/${workplaceUid}/permissions`);
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
    const permissions = this.permissions(workplaceUid);
    return permissions.hasOwnProperty(permissionType) && permissions[permissionType] ? true : false;
  }

  public handlePermissionsCheck(requiredPermissions: string[], permissionsList: PermissionsList): boolean {
    if (!this.hasValidPermissions(requiredPermissions, permissionsList)) {
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
    return requiredPermissions.every(item => userPermissions.includes(item));
  }
}
