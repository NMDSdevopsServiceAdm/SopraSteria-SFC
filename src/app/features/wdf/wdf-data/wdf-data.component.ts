import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { WDFReport } from '@core/model/reports.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wdf-data',
  templateUrl: './wdf-data.component.html',
})
export class WdfDataComponent implements OnInit {
  public workplace: Establishment;
  public workerCount: number;
  public report: WDFReport;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public returnUrl: URLStructure;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private breadcrumbService: BreadcrumbService,
    private workerService: WorkerService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WDF);
    this.returnUrl = { url: ['/wdf', 'data'] };

    const workplaceUid = this.establishmentService.primaryWorkplace.uid;

    this.subscriptions.add(
      combineLatest([
        this.establishmentService.getEstablishment(workplaceUid, true),
        this.reportService.getWDFReport(workplaceUid),
        this.workerService.getTotalStaffRecords(workplaceUid),
      ])
        .pipe(take(1))
        .subscribe(([workplace, report, totalStaffRecords]) => {
          this.report = report;
          this.setDates(report);
          this.workplace = workplace;
          this.establishmentService.setState(workplace);
          this.workerCount = totalStaffRecords;
        }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private setDates(report: WDFReport): void {
    this.wdfStartDate = moment(report.effectiveFrom).format('D MMMM YYYY');
    this.wdfEndDate = moment(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
  }
}
