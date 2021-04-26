import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { WDFReport } from '@core/model/reports.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import { sortBy } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wdf-data',
  templateUrl: './wdf-data.component.html',
})
export class WdfDataComponent implements OnInit {
  public workplace: Establishment;
  public workplaceUid: string;
  public workers: Array<Worker>;
  public workerCount: number;
  public canViewWorker: boolean;
  public report: WDFReport;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public returnUrl: URLStructure;
  public overallWdfEligibility: boolean;
  public workplaceWdfEligibility: boolean;
  public staffWdfEligibility: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private breadcrumbService: BreadcrumbService,
    private workerService: WorkerService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WDF);
    this.returnUrl = { url: ['/wdf', 'data'] };

    this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.canViewWorker = this.permissionsService.can(this.workplaceUid, 'canViewWorker');

    this.setWorkplace();
    this.getWdfReport();
    this.setWorkerCount();

    if (this.canViewWorker) {
      this.subscriptions.add(
        this.workerService
          .getAllWorkers(this.workplaceUid)
          .pipe(take(1))
          .subscribe((workers) => {
            this.workers = sortBy(workers, ['wdfEligible']);
          }),
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private setWorkplace() {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.workplaceUid, true).subscribe((workplace) => {
        this.workplace = workplace;
        this.establishmentService.setState(workplace);
      }),
    );
  }

  private getWdfReport() {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplaceUid).subscribe((report) => {
        this.report = report;
        this.setDates(report);
        this.setWdfEligibility(report);
      }),
    );
  }

  private setWorkerCount() {
    this.subscriptions.add(
      this.workerService.getTotalStaffRecords(this.workplaceUid).subscribe((totalStaffRecords) => {
        this.workerCount = totalStaffRecords;
      }),
    );
  }

  private setDates(report: WDFReport): void {
    this.wdfStartDate = moment(report.effectiveFrom).format('D MMMM YYYY');
    this.wdfEndDate = moment(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
  }

  private setWdfEligibility(report: WDFReport): void {
    this.overallWdfEligibility = report.wdf.overall;
    this.workplaceWdfEligibility = report.wdf.workplace;
    this.staffWdfEligibility = report.wdf.staff;
  }
}
