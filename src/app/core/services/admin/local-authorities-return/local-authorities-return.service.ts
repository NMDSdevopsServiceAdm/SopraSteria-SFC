import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IndividualLA, LAs, SetDates } from '@core/model/admin/local-authorities-return.model';
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

  public getLA(localAuthorityId: string): Observable<IndividualLA> {
    return this.http.get<IndividualLA>(`/api/admin/local-authority-return/monitor/${localAuthorityId}`);
  }

  public updateLA(localAuthorityId: string, localAuthority: IndividualLA): Observable<IndividualLA> {
    return this.http.post<IndividualLA>(
      `/api/admin/local-authority-return/monitor/${localAuthorityId}`,
      localAuthority,
    );
  }

  public resetLAs(): Observable<LAs> {
    return this.http.put<LAs>(`/api/admin/local-authority-return/monitor/reset`, {});
  }
}
