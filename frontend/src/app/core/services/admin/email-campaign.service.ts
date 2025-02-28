import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TemplatesResponse, TotalEmailsResponse } from '@core/model/emails.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class EmailCampaignService {
  constructor(private http: HttpClient) {}

  getInactiveWorkplaces(stopViewRefresh: boolean = false): Observable<any> {
    let params = new HttpParams();
    params = params.set('stopViewRefresh', stopViewRefresh);
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/inactive-workplaces`, {
      params,
    });
  }

  getInactiveWorkplcesForDeletion(stopViewRefresh: boolean = false): Observable<any> {
    let params = new HttpParams();
    params = params.set('stopViewRefresh', stopViewRefresh);
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/inactive-workplaces/inactiveWorkplacesForDeletion`, {
      params,
    });
  }

  inactiveWorkplcesForDeletion(stopViewRefresh: boolean = false): Observable<any> {
    let params = new HttpParams();
    params = params.set('stopViewRefresh', stopViewRefresh);
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/inactive-workplaces/inactiveWorkplacesIdsForDeletions`, {
      params,
    });
  }

  createInactiveWorkplacesCampaign(): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/inactive-workplaces`, {});
  }

  getInactiveWorkplacesHistory(): Observable<any> {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/inactive-workplaces/history`);
  }

  getInactiveWorkplacesReport(stopViewRefresh: boolean = false): Observable<any> {
    let params = new HttpParams();
    params = params.set('stopViewRefresh', stopViewRefresh);
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/inactive-workplaces/report`, {
      observe: 'response',
      responseType: 'blob' as 'json',
      params,
    });
  }

  getTargetedTotalEmails(groupType: string): Observable<TotalEmailsResponse> {
    let params = new HttpParams();
    params = params.set('groupType', groupType);

    return this.http.get<TotalEmailsResponse>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/targeted-emails/total`, {
      params,
    });
  }

  getTargetedTemplates(): Observable<TemplatesResponse> {
    return this.http.get<TemplatesResponse>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/targeted-emails/templates`);
  }

  getTargetedTotalValidEmails(fileFormData: FormData): Observable<TotalEmailsResponse> {
    return this.http.post<TotalEmailsResponse>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/targeted-emails/total`, fileFormData, {
      headers: { InterceptorSkipHeader: 'true' },
      params: { groupType: 'multipleAccounts' },
    });
  }

  getTargetedEmailsReport(fileFormData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/targeted-emails/report`, fileFormData, {
      headers: { InterceptorSkipHeader: 'true' },
      observe: 'response',
      responseType: 'blob' as 'json',
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

    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/email-campaigns/targeted-emails`, nmdsIdsFileData || payload, {
      headers: nmdsIdsFileData ? { InterceptorSkipHeader: 'true' } : {},
    });
  }
}
