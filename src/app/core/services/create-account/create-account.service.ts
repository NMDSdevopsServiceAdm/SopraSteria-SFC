import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { UserDetails } from '@core/model/userDetails.model';

@Injectable({
  providedIn: 'root',
})
export class CreateAccountService {
  public accountDetails$: BehaviorSubject<UserDetails> = new BehaviorSubject(null);
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);
}
