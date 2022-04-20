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

  getTargetedTotalValidEmails(fileFormData: FormData): Observable<TotalEmailsResponse> {
    return this.http.post<TotalEmailsResponse>('/api/admin/email-campaigns/targeted-emails/total', fileFormData, {
      headers: { InterceptorSkipHeader: 'true' },
      params: { groupType: 'multipleAccounts' },
    });
  }

  createTargetedEmailsCampaign(groupType: string, templateId: string, nmdsIdsFileData?: FormData): Observable<any> {
    const payload = {
      groupType,
      templateId,
    };

    if (nmdsIdsFileData) {
      const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      nmdsIdsFileData.append('jsonPayload', jsonBlob);
    }

    return this.http.post<any>('/api/admin/email-campaigns/targeted-emails', nmdsIdsFileData || payload, {
      headers: nmdsIdsFileData ? { InterceptorSkipHeader: 'true' } : {},
    });
  }
}
