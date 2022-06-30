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
    return this.http.get<UserDetails[]>('/api/user/admin');
  }

  public createAdminUser(requestPayload: CreateAccountRequest): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(`/api/user/add/admin`, requestPayload);
  }

  public getAdminUser(userId: string): Observable<UserDetails> {
    return this.http.get<UserDetails>(`/api/user/admin/${userId}`);
  }
}
