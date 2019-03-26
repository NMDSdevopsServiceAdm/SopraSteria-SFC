import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpErrorHandler } from './http-error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {}

  // TODO remove when merged https://github.com/NMDSdevopsServiceAdm/SopraSteria-SFC/pull/181
  private getOptions() {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return { headers };
  }

  /*
   * GET /api/country
   */
  getCountries(): Observable<CountryResponse[]> {
    return this.http.get<any>('/api/country', this.getOptions()).pipe(
      map(res => res.countries),
      catchError(this.httpErrorHandler.handleHttpError)
    );
  }
}

export interface CountryResponse {
  id: number;
  country: string;
}
