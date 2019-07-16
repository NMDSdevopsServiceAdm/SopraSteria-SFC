import { BehaviorSubject } from 'rxjs';
import { CreateAccountRequest } from '@core/model/account.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';

@Injectable({
  providedIn: 'root',
})
export class CreateAccountService {
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);

  constructor(private http: HttpClient) {}

  public createAccount(establishmentUid: string, requestPayload: CreateAccountRequest) {
    return this.http.post(`/api/user/add/establishment/${establishmentUid}`, requestPayload);
  }
}
