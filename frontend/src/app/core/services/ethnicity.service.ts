import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EthnicityFullResponse, EthnicityResponse } from '../model/ethnicity.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EthnicityService {
  constructor(private http: HttpClient) {}

  public getEthnicities(): Observable<EthnicityResponse> {
    return this.http.get<EthnicityFullResponse>(`${environment.appRunnerEndpoint}/api/ethnicity`).pipe(map((res) => res.ethnicities));
  }
}
