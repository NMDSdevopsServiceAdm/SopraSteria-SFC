import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationSearchResponse } from '@core/model/location.model';
import { Observable } from 'rxjs';

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

  public getUnassignedLocationByPostCode(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`/api/locations/pc/matching/${id}`);
  }

  public getUnassignedLocationByLocationId(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`/api/locations/lid/matching/${id}`);
  }
}
