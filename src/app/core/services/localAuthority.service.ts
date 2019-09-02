import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { LocalAuthorityModel } from '../model/localAuthority.model';

@Injectable({
  providedIn: 'root',
})
export class LocalAuthorityService {
  constructor(private http: HttpClient) {}

  getAuthorities() {
    return this.http.get<LocalAuthorityModel[]>('/api/localAuthority');
  }

  private handleHttpError(error: HttpErrorResponse): Observable<LocalAuthorityModel[]> {
    // on failing to fetch authorities, add a default authority
    // TODO: this needs some work to return a subscribable observer which is a default set of data
    //        which simplifies error handling in the components that consume it.
    return of([
      {
        custodianCode: 0,
        name: 'Unknown Authorities',
      },
    ]);
  }
}
