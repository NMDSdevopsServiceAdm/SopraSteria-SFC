import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TemplatesResponse, TotalEmailsResponse } from '@core/model/emails.model';
import { Observable } from 'rxjs';

@Injectable()
export class EmailCampaignService {
  constructor(private http: HttpClient) {}

  getInactiveWorkplaces(): Observable<any> {
    return this.http.get<any>('/api/admin/email-campaigns/inactive-workplaces');
  }

  createInactiveWorkplacesCampaign(): Observable<any> {
    return this.http.post<any>('/api/admin/email-campaigns/inactive-workplaces', {});
  }

  getInactiveWorkplacesHistory(): Observable<any> {
    return this.http.get<any>('/api/admin/email-campaigns/inactive-workplaces/history');
  }

  getInactiveWorkplacesReport(): Observable<any> {
    return this.http.get<any>('/api/admin/email-campaigns/inactive-workplaces/report', {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  getTargetedTotalEmails(groupType: string): Observable<TotalEmailsResponse> {
    let params = new HttpParams();
    params = params.set('groupType', groupType);

    return this.http.get<TotalEmailsResponse>('/api/admin/email-campaigns/targeted-emails/total', {
      params,
    });
  }

  getTargetedTemplates(): Observable<TemplatesResponse> {
    return this.http.get<TemplatesResponse>('/api/admin/email-campaigns/targeted-emails/templates');
  }

  getTargetedTotalValidEmails(fileToUpload: File): Observable<TotalEmailsResponse> {
    const file: FormData = new FormData();
    file.append('targetedRecipientsFile', fileToUpload, fileToUpload.name);

    return this.http.post<TotalEmailsResponse>('/api/admin/email-campaigns/targeted-emails/total', file, {
      headers: { InterceptorSkipHeader: 'true' },
      params: { groupType: 'multipleAccounts' },
    });
  }

  createTargetedEmailsCampaign(groupType: string, templateId: string): Observable<any> {
    return this.http.post<any>('/api/admin/email-campaigns/targeted-emails', {
      groupType,
      templateId,
    });
  }
}
