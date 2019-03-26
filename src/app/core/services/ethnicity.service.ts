import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';

import { Ethnicity } from '../model/ethnicity.model';
import { EstablishmentService } from './establishment.service';
import { HttpErrorHandler } from './http-error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class EthnicityService {
  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {}

  /*
   * GET /api/ethnicity
   */
  getEthnicities(): Observable<EthnicityResponse> {
    return this.http.get<any>('/api/ethnicity', EstablishmentService.getOptions()).pipe(
      debounceTime(500),
      map(res => res.ethnicities),
      catchError(this.httpErrorHandler.handleHttpError)
    );
  }
}

export interface EthnicityResponse {
  list: Ethnicity[];
  byGroup: any;
}
