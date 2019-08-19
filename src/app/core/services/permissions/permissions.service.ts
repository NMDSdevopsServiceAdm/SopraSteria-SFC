import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Permissions, PermissionsResponse } from '@core/model/permissions.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private _permissions$ = new BehaviorSubject<Permissions>(null);
  private _subsidiaryPermissions$ = new BehaviorSubject<PermissionsResponse[]>(null);

  constructor(private http: HttpClient) {}

  public get permissions$(): Observable<Permissions> {
    return this._permissions$.asObservable();
  }

  public get permissions(): Permissions {
    return this._permissions$.value;
  }

  public set permissions(permissions: Permissions) {
    this._permissions$.next(permissions);
  }

  public getPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    return this.http.get<PermissionsResponse>(`/api/establishment/${workplaceUid}/permissions`);
  }

  public getSubsidiaryPermissions(workplaceUid: string): PermissionsResponse | null {
   return this._subsidiaryPermissions$.value.filter((item => item.uid === workplaceUid))[0] || null;
  }

  public setSubsidiaryPermissions(permissions: PermissionsResponse) {
    const subsidiaryPermissions: PermissionsResponse[] = this._subsidiaryPermissions$.value;
    subsidiaryPermissions.push(permissions);
    this._subsidiaryPermissions$.next(subsidiaryPermissions);
  }
}
