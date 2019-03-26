import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
    return this.http.post<RequestPasswordResetResponse>('/api/registration/requestPasswordReset', { usernameOrEmail });
  }

  validatePasswordReset(data) {
    return this.http.post('/api/registration/validateResetPassword', { uuid: data }, { observe: 'response' });
  }

  resetPassword(data, token) {
    const newPassword = { password: data };
    const headers = new HttpHeaders({ Authorization: token });

    return this.http.post<any>('/api/user/resetPassword', newPassword, { headers, responseType: 'text' as 'json' });
  }

  changePassword(data) {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders({ Authorization: token });

    return this.http.post<any>('/api/user/changePassword', data, { headers, responseType: 'text' as 'json' });
  }

  updateState(data) {
    this._resetPasswordUUID$.next(data);
  }
}
