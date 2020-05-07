import { PermissionsService } from '@core/services/permissions/permissions.service';
import { PermissionType } from '@core/model/permissions.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';

export class MockPermissionsService extends PermissionsService {
  private _permissions: PermissionType[] = [];

  public static factory(permissions: PermissionType[]) {
    return (http: HttpClient, router: Router, userService: UserService) => {
      const service = new MockPermissionsService(http, router, userService);
      service._permissions = permissions;
      return service;
    };
  }

  public can(workplaceUid: string, permissionType: PermissionType): boolean {
    return this._permissions.includes(permissionType);
  }
}
