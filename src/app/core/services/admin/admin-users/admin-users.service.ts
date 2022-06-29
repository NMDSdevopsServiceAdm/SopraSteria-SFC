import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateAccountRequest, CreateAccountResponse } from '@core/model/account.model';
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

  // public createAdminUser(newUser: UserDetails): Observable<UserDetails> {
  //   return this.http.post<UserDetails>('/api/admin/admin-users/create-admin-user', { adminUser: newUser });
  // }

  public createAdminUser(requestPayload: CreateAccountRequest): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(`/api/user/add/admin`, requestPayload);
  }
}
