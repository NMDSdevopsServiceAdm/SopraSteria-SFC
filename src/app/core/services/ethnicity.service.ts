import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EthnicityFullResponse, EthnicityResponse } from '../model/ethnicity.model';

@Injectable({
  providedIn: 'root',
})
export class EthnicityService {
  constructor(private http: HttpClient) {}

  getEthnicities(): Observable<EthnicityResponse> {
    return this.http.get<EthnicityFullResponse>('/api/ethnicity').pipe(map(res => res.ethnicities));
  }
}
