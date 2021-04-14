import { Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { WDFReport } from '@core/model/reports.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wdf-overview',
  templateUrl: './wdf-overview.component.html',
})
export class WdfOverviewComponent implements OnInit {
  public workplace: Establishment;
  public report: WDFReport;
  public wdfStartYear: string;
  public wdfEndYear: string;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService, private reportService: ReportService) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplace.uid).subscribe((report) => {
        this.report = report;
        this.wdfStartYear = moment(this.report.effectiveFrom).format('YYYY');
        this.wdfEndYear = moment(this.report.effectiveFrom).add(1, 'years').format('YYYY');
      }),
    );
  }
}
