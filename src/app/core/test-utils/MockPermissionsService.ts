import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionsList, PermissionsResponse, PermissionType } from '@core/model/permissions.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockPermissionsService extends PermissionsService {
  private _permissions: PermissionType[] = [];

  public static factory(permissions: PermissionType[] = []) {
    return (http: HttpClient, router: Router, userService: UserService) => {
      const service = new MockPermissionsService(http, router, userService);
      service._permissions = permissions;
      return service;
    };
  }

  permissions(workplaceUid: string): PermissionsList {
    const perms = {};
    this._permissions.forEach((p) => (perms[p] = true));
    return perms;
  }
  public getPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    const perms = {};
    this._permissions.forEach((p) => (perms[p] = true));

    return of({
      uid: '',
      permissions: perms,
    } as PermissionsResponse);
  }
}
