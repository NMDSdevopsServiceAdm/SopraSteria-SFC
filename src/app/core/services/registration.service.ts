import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { RegistrationPayload } from '@core/model/registration.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { CreationService } from './creation.service';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService extends CreationService {
  public registrationInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);
  public returnTo$ = new BehaviorSubject<URLStructure>(null);
  public searchMethod$: BehaviorSubject<string> = new BehaviorSubject(null);
  public postcodeOrLocationId$: BehaviorSubject<string> = new BehaviorSubject(null);
  public workplaceNotFound$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private http: HttpClient) {
    super();
  }

  public postRegistration(registrationPayload: Array<RegistrationPayload>): Observable<any> {
    return this.http.post<any>('/api/registration/', registrationPayload);
  }

  /* TODO: Give proper return */
  public getUsernameDuplicate(id: string): Observable<any> {
    return this.http.get(`/api/registration/username/${id}`);
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }
}
