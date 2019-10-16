import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) {}

  getWDFReport(establishmentId: string, updatedEffectiveFrom?: string): Observable<WDFReport> {
    let params: HttpParams;

    if (updatedEffectiveFrom) {
      params = new HttpParams().set('effectiveFrom', updatedEffectiveFrom);
    }

    return this.http.get<WDFReport>(`/api/reports/wdf/establishment/${establishmentId}`, {
      params,
    });
  }

  public getWdfSummaryReport(): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`/api/reports/wdfSummary`, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  public getLocalAuthorityReport(workplaceUid: string): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`/api/reports/localauthority/${workplaceUid}`, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  public getLocalAuthorityAdminReport(): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`/api/reports/localauthority/admin`, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  getPatrentWDFReport(workplaceUid: string): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`/api/reports/wdf/establishment/${workplaceUid}`, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }
}
