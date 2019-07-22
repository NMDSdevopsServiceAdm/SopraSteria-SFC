import {
  ActivateAccountRequest,
  CreateAccountRequest,
  ValidateAccountActivationTokenRequest,
  ValidateAccountActivationTokenResponse,
} from '@core/model/account.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { UserDetails } from '@core/model/userDetails.model';
import { URLStructure } from '@core/model/url.model';

@Injectable({
  providedIn: 'root',
})
export class CreateAccountService {
  public userDetails$: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(null);
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);
  public activationComplete$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public returnTo$ = new BehaviorSubject<URLStructure>(null);

  constructor(private http: HttpClient) {}

  public createAccount(establishmentUid: string, requestPayload: CreateAccountRequest) {
    return this.http.post(`/api/user/add/establishment/${establishmentUid}`, requestPayload);
  }

  public activateAccount(requestPayload: ActivateAccountRequest) {
    return this.http.post(`/api/user/add`, requestPayload);
  }

  public validateAccountActivationToken(
    requestPayload: ValidateAccountActivationTokenRequest
  ): Observable<HttpResponse<ValidateAccountActivationTokenResponse>> {
    return this.http.post<ValidateAccountActivationTokenResponse>(`/api/user/validateAddUser`, requestPayload, {
      observe: 'response',
    });
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }
}
