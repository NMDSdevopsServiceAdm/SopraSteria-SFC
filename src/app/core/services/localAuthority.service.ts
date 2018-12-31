// fetches and caches the set of Local Authorities (300+)
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LocalAuthorityModel } from '../model/localAuthority.model';

@Injectable({
  providedIn: 'root'
})
export class LocalAuthorityService {
  constructor(private http: HttpClient) { }

  // initialise an empty set of authorities
  // TODO: cache this in local/session storage with an expiry (what is the expiry?)
  private _authorities: Observable<LocalAuthorityModel[]> = null;
  private _url: string = '/api/localAuthority';

  getAuthorities() {
    if (!this._authorities) {
      const options = { headers: { 'Content-type': 'application/json' } };
      return this.http.get<LocalAuthorityModel[]>('/api/localAuthority', options)
       .pipe(
         catchError(err => this.handleHttpError(err))
       );
    } else {
      return this._authorities;
    }
  }

  private handleHttpError(error: HttpErrorResponse): Observable<LocalAuthorityModel[]> {
    // on failing to fetch authorities, add a default authority
    // TODO: this needs some work to return a subscribable observer which is a default set of data
    //        which simplifies error handling in the components that consume it.
    return Observable.create([{
      custodianCode: 0,
      name: 'Unknown Authorities'
    }]);
  }
}








