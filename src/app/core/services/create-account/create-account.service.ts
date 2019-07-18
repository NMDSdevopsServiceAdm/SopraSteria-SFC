import { ActivateAccountRequest, CreateAccountRequest, ValidateAccountActivationTokenRequest } from '@core/model/account.model';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { UserDetails } from '@core/model/userDetails.model';

@Injectable({
  providedIn: 'root',
})
export class CreateAccountService {
  public userDetails$: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(null);
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);

  constructor(private http: HttpClient) {}

  public createAccount(establishmentUid: string, requestPayload: CreateAccountRequest) {
    return this.http.post(`/api/user/add/establishment/${establishmentUid}`, requestPayload);
  }

  public activateAccount(requestPayload: ActivateAccountRequest) {
    return this.http.post(`/api/user/add`, requestPayload);
  }

  public validateAccountActivationToken(requestPayload: ValidateAccountActivationTokenRequest) {
    return this.http.post(`/api/user/validateAddUser`, requestPayload);
  }
}
