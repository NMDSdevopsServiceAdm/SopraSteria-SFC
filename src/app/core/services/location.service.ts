import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LocationService {
  constructor(private http: HttpClient) {}

  getAllLocations(): Observable<Location[]> {
    return this.http.get<Location[]>('/api/locations').pipe(map(res => res));
  }

  getLocationByid(id: string): Observable<Location> {
    return this.http.get<Location>(`/api/locations/${id}`);
  }

  getLocationByPostCode(id: string): Observable<Location[]> {
    return this.http.get<Location[]>(`/api/locations/pc/${id}`);
  }
}
