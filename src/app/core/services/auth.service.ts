import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoggedInEstablishment, LoggedInMainService, LoggedInSession } from '@core/model/logged-in.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';

import { RegistrationTrackerError } from '../model/registrationTrackerError.model';
import { EstablishmentService } from './establishment.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Observable login source
  private _auth$: BehaviorSubject<LoggedInSession> = new BehaviorSubject<LoggedInSession>(null);

  // hold the response from login
  private _session: LoggedInSession = null;
  private _token: string = null;

  public redirect: string;

  // Observable login stream
  public auth$: Observable<LoggedInSession> = this._auth$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private establishmentService: EstablishmentService,
    private userService: UserService
  ) {}

  public get isLoggedIn(): boolean {
    return !!this.token;
  }

  public get establishment(): LoggedInEstablishment | null {
    if (this._session) {
      return this._session.establishment;
    } else {
      return null;
    }
  }
  public get mainService(): LoggedInMainService | null {
    if (this._session) {
      return this._session.mainService;
    } else {
      return null;
    }
  }
  public get fullname(): string | null {
    if (this._session) {
      return this._session.fullname;
    } else {
      return null;
    }
  }
  public get isFirstLogin(): boolean {
    if (this._session) {
      return this._session.isFirstLogin;
    } else {
      return false;
    }
  }
  public get isFirstBulkUpload(): boolean {
    if (this._session) {
      return this._session.establishment.isFirstBulkUpload;
    } else {
      return true;
    }
  }

  public set isFirstBulkUpload(isFirstBulkUpload) {
    this._session.establishment.isFirstBulkUpload = isFirstBulkUpload;
  }

  public get lastLoggedIn() {
    return this._session ? this._session.lastLoggedIn : null;
  }

  public resetFirstLogin(): boolean {
    if (this._session) {
      this._session.isFirstLogin = false;

      // successfully reset
      return true;
    } else {
      return false;
    }
  }

  set token(token: string) {
    this._token = token;

    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
  }

  get token() {
    if (!this._token) {
      this._token = localStorage.getItem('auth-token');
    }

    return this._token;
  }

  authorise(token) {
    this.token = token;
  }

  postLogin(id: any) {
    const $value = id;
    return this.http.post<any>('/api/login/', $value, { observe: 'response' });
  }

  refreshToken() {
    return this.http.get<any>(`/api/login/refresh`, { observe: 'response' });
  }

  private handleHttpError(error: HttpErrorResponse): Observable<RegistrationTrackerError> {
    const dataError = new RegistrationTrackerError();
    dataError.message = error.message;
    dataError.success = error.error.success;
    dataError.friendlyMessage = error.error.message;
    return ErrorObservable.create(dataError);
  }

  updateState(data) {
    this._auth$.next(data);
    this._session = data;
  }

  logout() {
    if (localStorage.getItem('auth-token')) {
      localStorage.clear();
      this._session = null;
      this.token = null;
      this.userService.loggedInUser = null;
      this.establishmentService.resetState();
      this.router.navigate(['/logged-out']);
    }
  }

  logoutWithoutRouting() {
    if (localStorage.getItem('auth-token')) {
      localStorage.clear();
      this._session = null;
      this.token = null;
    }
  }
}
