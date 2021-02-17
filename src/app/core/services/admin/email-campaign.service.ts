import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class EmailCampaignService {
  constructor(private http: HttpClient) {}

  getInactiveWorkplaces(): Observable<any> {
    return this.http.get<any>('/api/admin/email-campaigns/inactive-workplaces');
  }

  createCampaign(): Observable<any> {
    return this.http.post<any>('/api/admin/email-campaigns/inactive-workplaces', {});
  }

  getHistory(): Observable<any> {
    return this.http.get<any>('/api/admin/email-campaigns/inactive-workplaces/history');
  }

  getReport(): Observable<any> {
    return this.http.get<any>('/api/admin/email-campaigns/inactive-workplaces/report', {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }
}
