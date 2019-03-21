import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, debounceTime } from 'rxjs/operators';

import { HttpErrorHandler } from './http-error-handler.service';

export interface RequestPasswordResetResponse {
  usernameOrEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private _resetPasswordUUID$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public resetPasswordUUID$: Observable<string> = this._resetPasswordUUID$.asObservable();

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {}

  requestPasswordReset(usernameOrEmail: string) {
    const requestHeaders = new HttpHeaders({ 'Content-type': 'application/json' });

    return this.http
      .post<RequestPasswordResetResponse>('/api/registration/requestPasswordReset', usernameOrEmail, {
        headers: requestHeaders,
      })
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  validatePasswordReset(data) {
    const uuidData = { uuid: data };
    const requestHeaders = new HttpHeaders({ 'Content-type': 'application/json' });

    return this.http
      .post('/api/registration/validateResetPassword', uuidData, { headers: requestHeaders, observe: 'response' })
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  resetPassword(data, token) {
    const newPassword = { password: data };
    const requestHeaders = new HttpHeaders({ 'Content-type': 'application/json', Authorization: token });

    return this.http
      .post<any>('/api/user/resetPassword', newPassword, { headers: requestHeaders, responseType: 'text' as 'json' })
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  updateState(data) {
    this._resetPasswordUUID$.next(data);
  }
}
