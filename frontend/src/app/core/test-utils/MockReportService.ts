import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockReportService extends ReportService {
  private overrides: any = {};

  public static factory(overrides: any) {
    return (httpClient: HttpClient, establishmentService: EstablishmentService) => {
      const service = new MockReportService(httpClient, establishmentService);
      service.overrides = overrides;
      return service;
    };
  }

  public getWDFReport(workplaceUid: string): Observable<WDFReport> {
    const d = new Date();
    //21 July YEAR
    d.setMonth(6);
    d.setDate(21);
    d.setHours(0, 0, 0, 0);
    const dateString = d.toISOString();

    return of({
      establishmentId: 1,
      timestamp: dateString,
      effectiveFrom: dateString,
      wdf: {
        overall: true,
        overallWdfEligibility: dateString,
        workplace: true,
        staff: true,
      },
      customEffectiveFrom: true,
      ...this.overrides,
    });
  }
}
