import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class FundingReportResolver  {
  constructor(
    private router: Router,
    private reportService: ReportService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid') ?? this.establishmentService.establishmentId;

    return this.reportService.getWDFReport(workplaceUid).pipe(
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(null);
      }),
    );
  }
}
