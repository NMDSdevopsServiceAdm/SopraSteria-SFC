import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADD_USER_API } from '@core/constants/constants';
import {
  ActivateAccountRequest,
  CreateAccountRequest,
  CreateAccountResponse,
  ValidateAccountActivationTokenRequest,
  ValidateAccountActivationTokenResponse,
} from '@core/model/account.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreateAccountService {
  public _userDetails$: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(null);
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);
  public activationComplete$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public returnTo$: BehaviorSubject<URLStructure> = new BehaviorSubject<URLStructure>(null);
  public userDetails$: Observable<UserDetails> = this._userDetails$.asObservable();
  public termsAndConditionsCheckbox$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public token: string;

  constructor(private http: HttpClient) {}

  public createAccount(
    establishmentUid: string,
    requestPayload: CreateAccountRequest,
  ): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(`/api/user/add/establishment/${establishmentUid}`, requestPayload);
  }

  public activateAccount(requestPayload: ActivateAccountRequest) {
    return this.http.post(ADD_USER_API, requestPayload);
  }

  public validateAccountActivationToken(
    requestPayload: ValidateAccountActivationTokenRequest,
  ): Observable<HttpResponse<ValidateAccountActivationTokenResponse>> {
    return this.http.post<ValidateAccountActivationTokenResponse>('/api/user/validateAddUser', requestPayload, {
      observe: 'response',
    });
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }
}
