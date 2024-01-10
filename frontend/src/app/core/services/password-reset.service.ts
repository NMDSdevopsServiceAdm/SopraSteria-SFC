import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface RequestPasswordResetResponse {
  usernameOrEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private _resetPasswordUUID$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public resetPasswordUUID$: Observable<string> = this._resetPasswordUUID$.asObservable();

  constructor(private http: HttpClient) {}

  requestPasswordReset(usernameOrEmail: string) {
    return this.http.post<RequestPasswordResetResponse>(`${environment.appRunnerEndpoint}/api/registration/requestPasswordReset`, { usernameOrEmail });
  }

  validatePasswordReset(data) {
    return this.http.post(`${environment.appRunnerEndpoint}/api/registration/validateResetPassword`, { uuid: data }, { observe: 'response' });
  }

  resetPassword(data, token) {
    const newPassword = { password: data };
    const headers = new HttpHeaders({ Authorization: token });

    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/user/resetPassword`, newPassword, { headers, responseType: 'text' as 'json' });
  }

  changePassword(data) {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/user/changePassword`, data, { responseType: 'text' as 'json' });
  }

  updateState(data) {
    this._resetPasswordUUID$.next(data);
  }
}
