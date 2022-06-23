import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDetails } from '@core/model/userDetails.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  constructor(private http: HttpClient) {}

  public getAdminUsers(): Observable<UserDetails[]> {
    return this.http.get<UserDetails[]>('/api/admin/admin-users');
  }
}
