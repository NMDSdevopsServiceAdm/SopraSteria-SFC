import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Permissions, PermissionsResponse } from '@core/model/permissions.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private _permissions$ = new BehaviorSubject<Permissions>(null);

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
    return this.http
      .get<PermissionsResponse>(`/api/establishment/${workplaceUid}/permissions`)
      .pipe(tap(response => (this.permissions = response.permissions)));
  }
}
