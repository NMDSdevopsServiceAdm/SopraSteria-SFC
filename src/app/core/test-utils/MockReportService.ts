import { Injectable } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';
import { ReportService } from '@core/services/report.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockReportService extends ReportService {
  public getWDFReport(workplaceUid: string): Observable<WDFReport> {
    const d = new Date();
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
    });
  }
}
