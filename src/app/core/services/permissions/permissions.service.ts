import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Permissions } from '@core/model/permissions.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  public permissions: Permissions;

  constructor(private http: HttpClient) {}

  public getPermissions(workplaceUid: string): Observable<Permissions> {
    return this.http.get<Permissions>(`/api/establishment/${workplaceUid}/permissions`).pipe(
      tap(permissions => {
        this.permissions = permissions;
      })
    );
  }
}
