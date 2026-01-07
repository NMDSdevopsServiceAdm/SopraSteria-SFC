import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateAccountRequest, CreateAccountResponse } from '@core/model/account.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  constructor(private http: HttpClient) {}

  public getAdminUsers(): Observable<UserDetails[]> {
    return this.http.get<UserDetails[]>(`${environment.appRunnerEndpoint}/api/user/admin`);
  }

  public createAdminUser(requestPayload: CreateAccountRequest): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(`${environment.appRunnerEndpoint}/api/user/add/admin`, requestPayload);
  }

  public getAdminUser(userId: string): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${environment.appRunnerEndpoint}/api/user/admin/${userId}`);
  }

  public updateAdminUserDetails(userId: string, userDetails: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${environment.appRunnerEndpoint}/api/user/admin/${userId}`, userDetails);
  }

  public deleteAdminUserDetails(userId: string) {
    return this.http.delete(`${environment.appRunnerEndpoint}/api/user/admin/${userId}`);
  }

  public resendActivationLinkAdmin(useruid: string) {
    return this.http.post(`${environment.appRunnerEndpoint}/api/user/${useruid}/resend-activation-admin`, null, {
      responseType: 'text' as 'json',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class ParentRequestsStateService {
  private readonly STORAGE_KEY = 'parentRequests';
  private readonly parentRequests$ = new BehaviorSubject<any[] | null>(this.loadFromStorage());

  private loadFromStorage(): any[] | null {
    const json = localStorage.getItem(this.STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  }

  private saveToStorage(data: any[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  set(data: any[]): void {
    this.saveToStorage(data);
    this.parentRequests$.next(data);
  }

  get$(): Observable<any[] | null> {
    return this.parentRequests$.asObservable();
  }

  getSnapshot(): any[] | null {
    return this.parentRequests$.value;
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.parentRequests$.next(null);
  }
}
