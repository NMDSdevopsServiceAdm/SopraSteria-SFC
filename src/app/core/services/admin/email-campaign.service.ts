import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class EmailCampaignService {
  constructor(private http: HttpClient) {}

  getHistory(): Observable<any> {
    return this.http.get<any>(`/api/admin/email-campaigns/inactive-workplaces/history`);
  }
}
