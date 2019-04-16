import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Ethnicity } from '../model/ethnicity.model';

@Injectable({
  providedIn: 'root',
})
export class EthnicityService {
  constructor(private http: HttpClient) {}

  getEthnicities(): Observable<EthnicityResponse> {
    return this.http.get<any>('/api/ethnicity').pipe(map(res => res.ethnicities));
  }
}

export interface EthnicityResponse {
  list: Ethnicity[];
  byGroup: any;
}
