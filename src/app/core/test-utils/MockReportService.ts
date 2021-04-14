import { Injectable } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';
import { ReportService } from '@core/services/report.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockReportService extends ReportService {
  public getWDFReport(workplaceUid: string): Observable<WDFReport> {
    return of({
      establishmentId: 1,
      timestamp: '2021-04-12T00:00:00.000Z',
      effectiveFrom: '2021-04-01T00:00:00.000Z',
      wdf: {
        overall: true,
        overallWdfEligibility: '2021-07-21T00:00:00.000Z',
        workplace: true,
        staff: true,
      },
      customEffectiveFrom: true,
    });
  }
}
