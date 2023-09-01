import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CSSR } from '@core/model/cssr.model'
import { Observable } from 'rxjs';

@Injectable()
export class LocalAuthoritiesService {
  constructor(private http: HttpClient) {}

  public getLAsList(): Observable<CSSR> {
    return this.http.get<CSSR>('/api/admin/local-authorities');
  }
}
