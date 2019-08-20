import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Permissions, PermissionsList, PermissionsResponse, PermissionType } from '@core/model/permissions.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private _permissions$ = new BehaviorSubject<Permissions>({});

  constructor(private http: HttpClient) {}

  public get permissions$(): Observable<Permissions> {
    return this._permissions$.asObservable();
  }

  public fetchPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    return this.http.get<PermissionsResponse>(`/api/establishment/${workplaceUid}/permissions`);
  }

  public getPermissions(workplaceUid: string): PermissionsList {
    return this._permissions$.value[workplaceUid];
  }

  public setPermissions(workplaceUid: string, permissions: PermissionsList) {
    const subsidiaryPermissions: Permissions = this._permissions$.value;
    subsidiaryPermissions[workplaceUid] = permissions;
    this._permissions$.next(subsidiaryPermissions);
  }

  public can(workplaceUid: string, permissionType: PermissionType): boolean {
    const permissions = this.getPermissions(workplaceUid);
    return permissions.hasOwnProperty(permissionType) && permissions.permissionType ? true : false;
  }
}
