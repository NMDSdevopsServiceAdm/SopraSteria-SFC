import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { RegistrationPayload } from '@core/model/registration.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { WorkplaceInterfaceService } from './workplace-interface.service';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService extends WorkplaceInterfaceService {
  public registrationInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);
  public termsAndConditionsCheckbox$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private http: HttpClient) {
    super();
  }

  public postRegistration(registrationPayload: RegistrationPayload): Observable<any> {
    return this.http.post<any>('/api/registration/', registrationPayload);
  }

  /* TODO: Give proper return */
  public getUsernameDuplicate(id: string): Observable<any> {
    return this.http.get(`/api/registration/username/${id}`);
  }

  public resetService(): void {
    super.resetService();

    this.registrationInProgress$.next(false);
    this.loginCredentials$.next(null);
    this.securityDetails$.next(null);
    this.termsAndConditionsCheckbox$.next(false);
  }
}
