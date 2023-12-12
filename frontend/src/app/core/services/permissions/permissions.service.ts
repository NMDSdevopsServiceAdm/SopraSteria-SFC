import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Permissions, PermissionsResponse, PermissionType } from '@core/model/permissions.model';
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

  public clearPermissions(): void {
    this._permissions$.next({});
  }

  public permissions(workplaceUid: string): PermissionType[] {
    return this._permissions$.value[workplaceUid];
  }

  public setPermissions(workplaceUid: string, permissions: PermissionType[]): void {
    const subsidiaryPermissions: Permissions = this._permissions$.value;

    subsidiaryPermissions[workplaceUid] = permissions;
    this._permissions$.next(subsidiaryPermissions);
  }

  public can(workplaceUid: string, permissionType: PermissionType): boolean {
    const permissions = this.permissions(workplaceUid);

    return permissions.includes(permissionType);
  }

  public handlePermissionsCheck(requiredPermissions: PermissionType[], permissionsList: PermissionType[]): boolean {
    if (!this.hasValidPermissions(requiredPermissions, permissionsList)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

  public hasWorkplacePermissions(workplaceUid: string) {
    const cachedPermissions = this.permissions(workplaceUid);
    if (cachedPermissions) {
      return of(true);
    }

    // TODO remove once user resolver is replaced by extra check in has permissions guard
    if (!workplaceUid) {
      return of(true);
    }

    return this.getPermissions(workplaceUid)
      .pipe(tap((response) => this.setPermissions(workplaceUid, response.permissions)))
      .pipe(
        catchError(() => {
          return of(null);
        }),
      )
      .pipe(map(() => true));
  }

  private hasValidPermissions(requiredPermissions: PermissionType[], permissionsList: PermissionType[]): boolean {
    if (!permissionsList) {
      return false;
    }

    return requiredPermissions.every((item) => permissionsList.includes(item));
  }
}
