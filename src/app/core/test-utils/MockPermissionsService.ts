import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionsResponse, PermissionType } from '@core/model/permissions.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { Observable, of } from 'rxjs';

const adminPermissions = [
  'canViewEstablishment',
  'canViewWdfReport',
  'canViewUser',
  'canViewListOfUsers',
  'canDownloadWdfReport',
  'canAddUser',
  'canBulkUpload',
  'canChangePermissionsForSubsidiary',
  'canDeleteUser',
  'canEditUser',
  'canViewListOfWorkers',
  'canViewWorker',
  'canAddWorker',
  'canEditWorker',
  'canDeleteWorker',
  'canTransferWorker',
  'canEditEstablishment',
  'canRunLocalAuthorityReport',
  'canLinkToParent',
  'canBecomeAParent',
  'canChangeDataOwner',
  'canDeleteEstablishment',
  'canDeleteAllEstablishments',
  'canRunLocalAuthorityAdminReport',
  'canViewWdfSummaryReport',
  'canSearchUsers',
  'canSearchEstablishment',
] as PermissionType[];

@Injectable()
export class MockPermissionsService extends PermissionsService {
  private _permissions: PermissionType[] = [];

  public static factory(permissions: PermissionType[] = [], isAdmin = false) {
    return (http: HttpClient, router: Router, userService: UserService) => {
      const service = new MockPermissionsService(http, router, userService);
      service._permissions = isAdmin ? adminPermissions : permissions;
      return service;
    };
  }

  permissions(workplaceUid: string): PermissionType[] {
    return this._permissions;
  }

  public getPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    return of({
      uid: '',
      permissions: this._permissions,
    } as PermissionsResponse);
  }
}
