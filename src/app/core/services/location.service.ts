import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocationSearchResponse } from '@core/model/location.model';

@Injectable()
export class LocationService {
  constructor(private http: HttpClient) {}

  public getLocationByPostCode(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`/api/locations/pc/${id}`);
  }

  public getLocationByLocationId(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`/api/locations/lid/${id}`);
  }

  public getAddressesByPostCode(postcode: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`/api/postcodes/${postcode}`);
  }
}
