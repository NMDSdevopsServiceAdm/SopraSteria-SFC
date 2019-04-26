import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationAddress, LocationSearchResponse } from '@core/model/location.model';
import { RegistrationPayload } from '@core/model/registration.model';
import { WorkplaceService } from '@core/model/workplace-service.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { WorkplaceCategory } from '@core/model/workplace-category.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  public registrationInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject(null);
  public selectedLocationAddress$: BehaviorSubject<LocationAddress> = new BehaviorSubject(null);
  public selectedWorkplaceService$: BehaviorSubject<WorkplaceService> = new BehaviorSubject(null);
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);

  constructor(private http: HttpClient) {}

  public postRegistration(registrationPayload: Array<RegistrationPayload>): Observable<any> {
    return this.http.post<any>('/api/registration/', registrationPayload);
  }

  public getLocationByPostCode(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`/api/locations/pc/${id}`);
  }

  public getLocationByLocationId(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`/api/locations/lid/${id}`);
  }

  public getAddressesByPostCode(postcode: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`/api/postcodes/${postcode}`);
  }

  public getServicesByCategory(isRegulated: boolean): Observable<Array<WorkplaceCategory>> {
    return this.http.get<Array<WorkplaceCategory>>(`/api/services/byCategory?cqc=${isRegulated}`);
  }

  public getUsernameDuplicate(id: string): Observable<any>  {
    return this.http.get(`/api/registration/username/${id}`);
  }

  public isRegulated(location: LocationAddress): boolean {
    return location.isRegulated === true || location.locationId ? true : false;
  }
}
