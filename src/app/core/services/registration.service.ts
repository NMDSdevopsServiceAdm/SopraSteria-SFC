import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { RegistrationPayload } from '@core/model/registration.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { Service } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  public registrationInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject(null);
  public selectedLocationAddress$: BehaviorSubject<LocationAddress> = new BehaviorSubject(null);
  public selectedWorkplaceService$: BehaviorSubject<Service> = new BehaviorSubject(null);
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);
  public isRegulated$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public manuallyEnteredWorkplace$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public returnTo$ = new BehaviorSubject<URLStructure>(null);
  public isRegistrationFlow$ = new BehaviorSubject<boolean>(null);

  constructor(private http: HttpClient) {}

  public isRegulated(): boolean {
    return this.isRegulated$.value;
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
