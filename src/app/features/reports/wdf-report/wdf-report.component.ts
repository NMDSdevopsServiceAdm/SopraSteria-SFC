import { Component, OnInit } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportsService } from '@core/services/reports.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wdf-report',
  templateUrl: './wdf-report.component.html',
})
export class WdfReportComponent implements OnInit {
  public report: WDFReport;
  constructor(private establishmentService: EstablishmentService, private reportsService: ReportsService) {}

  ngOnInit() {
    this.reportsService
      .getWDFReport(this.establishmentService.establishmentId)
      .pipe(take(1))
      .subscribe(report => {
        this.report = report;
      });
  }
}
