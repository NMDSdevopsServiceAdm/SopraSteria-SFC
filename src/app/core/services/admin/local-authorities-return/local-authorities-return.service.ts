import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LAs, SetDates } from '@core/model/admin/local-authorities-return.model';
import { Observable } from 'rxjs';

@Injectable()
export class LocalAuthoritiesReturnService {
  constructor(private http: HttpClient) {}

  public getDates(): Observable<SetDates> {
    return this.http.get<SetDates>('/api/admin/local-authority-return/dates');
  }

  public setDates(dates: SetDates): Observable<SetDates> {
    return this.http.post<SetDates>('/api/admin/local-authority-return/dates', dates);
  }

  public getLAs(): Observable<LAs> {
    return this.http.get<LAs>('/api/admin/local-authority-return/monitor');
  }
}
