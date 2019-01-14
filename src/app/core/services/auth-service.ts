import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';

import { HttpErrorHandler } from "./http-error-handler.service"
import { LoginApiModel } from '../model/loginApi.model';
import { RegistrationTrackerError } from '../model/registrationTrackerError.model';

// TODO do we still need it?
const initialRegistration: LoginApiModel = {
  // Example initial dummy data
  username: 'Uname3',
  password: 'Bob',
};

interface LoggedInMainService {
  id: number;
  name: string
}
interface LoggedInEstablishment {
  id: number;
  name: string;
  isRegulated: boolean
};
interface LoggedInSession {
  fullname: string,
  isFirstLogin: boolean,
  establishment: LoggedInEstablishment;
  mainService: LoggedInMainService;
};

// TODO this file should be renamed to auth.service
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable login source
  private _auth$: BehaviorSubject<LoginApiModel> = new BehaviorSubject<LoginApiModel>(initialRegistration);

  // hold the response from login
  private _session: LoggedInSession = null;
  private _token: string = null;

  // Observable login stream
  public auth$: Observable<LoginApiModel> = this._auth$.asObservable();


  constructor(private http: HttpClient,
              private httpErrorHandler: HttpErrorHandler,
              private router: Router) { }

  // returns true if logged in; otherwise false
  public get isLoggedIn(): boolean {
    return this._session ? true : false;
  }

  public get establishment() : LoggedInEstablishment {
    if (this._session) {
      return this._session.establishment;
    } else {
      return null;
    }
  }
  public get mainService() : LoggedInMainService {
    if (this._session) {
      return this._session.mainService;
    } else {
      return null;
    }
  }
  public get fullname() : string {
    if (this._session) {
      return this._session.fullname;
    } else {
      return null;
    }
  }
  public get isFirstLogin() : boolean {
    if (this._session) {
      return this._session.isFirstLogin;
    } else {
      return false;
    }
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
    this._token = token
    localStorage.setItem("auth-token", token)
  }

  get token() {
    if (!this._token) {
      this._token = localStorage.getItem("auth-token")
    }

    return this._token
  }

  authorise(token) {
    this.token = token
  }

  postLogin(id: any) {
    const $value = id;
    const requestHeaders = new HttpHeaders({ 'Content-type': 'application/json' });
    return this.http.post<any>('/api/login/', $value, { headers: requestHeaders, observe: 'response' });
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

    // TODO: because I don't understand how to extract data from the observable
    //      and I don't understand Denny's original intentions in storing the LoginApiModel
    //      which is the username/password rather than the login API response.
    this._session = data;
  }

  logout() {
    this._session = null
    this._token = null
  }
}
