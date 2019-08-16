import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermissionsResponse } from '@core/model/permissions.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  public permissions$ = new BehaviorSubject<{ [key: string]: boolean }>(null);

  constructor(private http: HttpClient) {}

  public getPermissions(workplaceUid: string): Observable<PermissionsResponse> {
    return this.http.get<PermissionsResponse>(`/api/establishment/${workplaceUid}/permissions`).pipe(
      tap(response => {
        this.permissions$.next(response.permissions);
      })
    );
  }
}
