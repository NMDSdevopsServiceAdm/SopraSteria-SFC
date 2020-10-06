import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LockStatus } from '@core/model/reportPolling.model';
import { WDFReport } from '@core/model/reports.model';
import { WDFLockStatus } from '@core/model/wdf.model';
import { from, interval, Observable } from 'rxjs';
import { concatMap, filter, map, startWith, take } from 'rxjs/operators';

import { EstablishmentService } from './establishment.service';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

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
    return this.checkLockStatus(
      {
        observe: 'response',
        responseType: 'blob' as 'json',
      },
      workplaceUid,
      'la',
    );
  }

  public getLocalAuthorityAdminReport(): Observable<HttpResponse<Blob>> {
    return this.checkLockStatus(
      {
        observe: 'response',
        responseType: 'blob' as 'json',
      },
      null,
      'adminla',
    );
  }

  public getParentWDFReport(workplaceUid: string): Observable<HttpResponse<Blob>> {
    return this.checkWDFLockStatus(
      () => this.http.get<Blob>(`/api/reports/wdf/establishment/${workplaceUid}/parent/report`),
      {
        observe: 'response',
        responseType: 'blob' as 'json',
      },
    );
  }

  // get Training report from training and qualifications
  public getTrainingReport(workplaceUid: string): Observable<HttpResponse<Blob>> {
    return this.checkLockStatus(
      {
        observe: 'response',
        responseType: 'blob' as 'json',
      },
      workplaceUid,
      'training',
    );
  }

  // Function to check for the lock status
  private checkLockStatus(httpOptions, workplaceUid, report): Observable<any> {
    let requestId;
    const reportData = {
      training: `/api/reports/training/establishment/${workplaceUid}/training`,
      la: `/api/reports/localAuthority/establishment/${workplaceUid}/user`,
      adminla: '/api/reports/localauthority/admin',
    };
    const apiPath = reportData[report];
    // Run function every second until lock aquired
    return (
      interval(1000)
        // Start he function straight away rather than waiting for the first second
        .pipe(startWith(0))
        .pipe(concatMap(() => from(this.http.get<LockStatus>(apiPath + '/report'))))
        // Don't go any further unless there's a request ID
        .pipe(filter((request: any) => typeof request.requestId === 'string'))
        .pipe(take(1))
        .pipe(
          map((request: any) => {
            requestId = request.requestId;
          }),
        )
        .pipe(
          // Run separate function to get the current lock status
          concatMap(() =>
            interval(5000)
              .pipe(startWith(0))
              .pipe(concatMap(() => from(this.http.get<LockStatus>(apiPath + '/lockstatus')))),
          ),
        )
        .pipe(filter((state) => state.reportLockHeld === false))
        .pipe(take(1))
        .pipe(concatMap(() => from(this.http.get<any>(apiPath + `/response/${requestId}`, httpOptions))))
    );
  }

  // Function to check for the lock status
  private checkWDFLockStatus(callback, httpOptions): Observable<any> {
    const establishmentUid = this.establishmentService.establishmentId;
    let requestId;
    // Run function every second until lock aquired
    return (
      interval(1000)
        // Start he function straight away rather than waiting for the first second
        .pipe(startWith(0))
        .pipe(concatMap(() => from(callback())))
        // Don't go any further unless there's a request ID
        .pipe(filter((request: any) => typeof request.requestId === 'string'))
        .pipe(take(1))
        .pipe(
          map((request: any) => {
            requestId = request.requestId;
          }),
        )
        .pipe(
          // Run serperate function to get the current lock status
          concatMap(() =>
            interval(5000)
              .pipe(startWith(0))
              .pipe(
                concatMap(() =>
                  from(
                    this.http.get<WDFLockStatus>(
                      `/api/reports/wdf/establishment/${establishmentUid}/parent/lockstatus`,
                    ),
                  ),
                ),
              ),
          ),
        )
        .pipe(filter((state) => state.WdfReportLockHeld === false))
        .pipe(take(1))
        .pipe(
          concatMap(() =>
            from(
              this.http.get<any>(
                `/api/reports/wdf/establishment/${establishmentUid}/parent/response/${requestId}`,
                httpOptions,
              ),
            ),
          ),
        )
    );
  }
}
