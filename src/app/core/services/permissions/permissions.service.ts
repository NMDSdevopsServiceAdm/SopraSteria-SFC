import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermissionsResponse } from '@core/model/permissions.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private _permissions$ = new BehaviorSubject<{ [key: string]: boolean }>(null);

  constructor(private http: HttpClient) {}

  public get permissions(): { [key: string]: boolean } {
    return this._permissions$.value;
  }

  public set permissions(permissions: { [key: string]: boolean }) {
    this._permissions$.next(permissions);
  }

  public getPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    return this.http
      .get<PermissionsResponse>(`/api/establishment/${workplaceUid}/permissions`)
      .pipe(tap(response => (this.permissions = response.permissions)));
  }
}
