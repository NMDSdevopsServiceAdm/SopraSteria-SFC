import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermissionsResponse, PermissionType } from '@core/model/permissions.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private _permissions$ = new BehaviorSubject<PermissionsResponse[]>([]);
  // private _subsidiaryPermissions$ = new BehaviorSubject<PermissionsResponse[]>(null);

  constructor(private http: HttpClient) {}

  public get permissions$(): Observable<PermissionsResponse[]> {
    return this._permissions$.asObservable();
  }

  // public get permissions(): PermissionsResponse {
  //   return this._permissions$.value;
  // }

  // public set permissions(permissions: PermissionsResponse) {
  //   this._permissions$.next(permissions);
  // }

  public getPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    return this.http.get<PermissionsResponse>(`/api/establishment/${workplaceUid}/permissions`);
  }

  public filterPermissions(workplaceUid: string): PermissionsResponse | null {
   return this._permissions$.value.filter((item => item.uid === workplaceUid))[0] || null;
  }

  public setPermissions(permissions: PermissionsResponse) {
    const subsidiaryPermissions: PermissionsResponse[] = this._permissions$.value;
    subsidiaryPermissions.push(permissions);
    this._permissions$.next(subsidiaryPermissions);
  }

  public can(workplaceUid: string, permission: PermissionType): boolean {
    return this.filterPermissions(workplaceUid).permissions.hasOwnProperty(permission);
  }
}
