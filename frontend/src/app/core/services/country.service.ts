import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  constructor(private http: HttpClient) {}

  getCountries(): Observable<CountryResponse[]> {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/country`).pipe(map(res => res.countries));
  }
}

export interface CountryResponse {
  id: number;
  country: string;
}
