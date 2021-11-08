import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { WDFReport } from '@core/model/reports.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { WdfEligibilityStatus } from '../../../core/model/wdf.model';
import { Worker } from '../../../core/model/worker.model';

@Component({
  selector: 'app-wdf-data',
  templateUrl: './wdf-data.component.html',
})
export class WdfDataComponent implements OnInit {
  public workplace: Establishment;
  public workplaceUid: string;
  public primaryWorkplaceUid: string;
  public workers: Array<Worker>;
  public workerCount: number;
  public canViewWorker = false;
  public canEditWorker: boolean;
  public report: WDFReport;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public returnUrl: URLStructure;
  public wdfEligibilityStatus: WdfEligibilityStatus = {};
  public isStandalone = true;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private breadcrumbService: BreadcrumbService,
    private workerService: WorkerService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;

    if (this.route.snapshot.params.establishmentuid) {
      this.workplaceUid = this.route.snapshot.params.establishmentuid;
      this.returnUrl = { url: ['/wdf', 'workplaces', this.workplaceUid] };
    } else {
      this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
      this.returnUrl = { url: ['/wdf', 'data'] };
    }

    this.canViewWorker = this.permissionsService.can(this.workplaceUid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');

    this.getWorkers();
    this.setWorkplace();
    this.getWdfReport();
    this.setWorkerCount();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private setWorkplace(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.workplaceUid, true).subscribe((workplace) => {
        this.workplace = workplace;
        this.isStandalone = this.checkIfStandalone();
        this.setBreadcrumbs();
        this.establishmentService.setState(workplace);
      }),
    );
  }

  private getWorkers(): void {
    if (this.canViewWorker) {
      this.subscriptions.add(
        this.workerService
          .getAllWorkers(this.workplaceUid)
          .pipe(take(1))
          .subscribe((workers) => {
            this.workers = sortBy(workers, ['wdfEligible']);
            this.wdfEligibilityStatus.currentStaff = this.getStaffWdfEligibility(workers);
          }),
      );
    }
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
    this.wdfStartDate = dayjs(report.effectiveFrom).format('D MMMM YYYY');
    this.wdfEndDate = dayjs(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
  }

  private setWdfEligibility(report: WDFReport): void {
    this.wdfEligibilityStatus.overall = report.wdf.overall;
    this.wdfEligibilityStatus.currentWorkplace = report.wdf.workplace;
  }

  public getStaffWdfEligibility(workers: Worker[]): boolean {
    if (workers.length == 0) {
      return false;
    }
    return workers.every((worker) => worker.wdfEligible === true);
  }

  private setBreadcrumbs(): void {
    this.isStandalone
      ? this.breadcrumbService.show(JourneyType.WDF)
      : this.breadcrumbService.show(JourneyType.WDF_PARENT);
  }

  private checkIfStandalone(): boolean {
    if (this.workplace) {
      if (this.primaryWorkplaceUid !== this.workplaceUid) {
        return false;
      }
      return !this.workplace.isParent;
    }
    return true;
  }
}
