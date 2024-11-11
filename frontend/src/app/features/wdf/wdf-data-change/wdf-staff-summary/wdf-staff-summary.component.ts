import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { TabsService } from '@core/services/tabs.service';
import { WorkerService } from '@core/services/worker.service';
import { StaffSummaryDirective } from '@shared/directives/staff-summary/staff-summary.directive';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-wdf-staff-summary',
  templateUrl: './wdf-staff-summary.component.html',
})
export class WdfStaffSummaryComponent extends StaffSummaryDirective implements OnInit {
  @Input() standAloneAccount: boolean;

  public workplaceUid: string;
  public primaryWorkplaceUid: string;
  public overallWdfEligibility: boolean;

  constructor(
    protected permissionsService: PermissionsService,
    protected workerService: WorkerService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected reportService: ReportService,
    protected tabsService: TabsService,
  ) {
    super(permissionsService, workerService, router, route, establishmentService, reportService, tabsService);
  }

  public getWorkerRecordPath(worker) {
    if (this.route.snapshot.params.establishmentuid) {
      this.workplaceUid = this.route.snapshot.params.establishmentuid;
      return ['/wdf', 'workplaces', this.workplaceUid, 'staff-record', worker.uid];
    } else {
      this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
      return ['/wdf', 'staff-record', worker.uid];
    }
  }

  protected init() {
    this.getOverallWdfEligibility();

    this.saveWorkerList();
    this.wdfView = true;
  }

  ngOnChanges() {
    this.workers = this.workers.map((worker) => {
      worker.jobRole = worker.mainJob.other ? worker.mainJob.other : worker.mainJob.title;
      return worker;
    });
    this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['asc']);

    this.saveWorkerList();
  }

  public saveWorkerList() {
    const listOfWorkerUids = this.workers.map((worker) => worker.uid);
    localStorage.setItem('ListOfWorkers', JSON.stringify(listOfWorkerUids));
  }

  private getOverallWdfEligibility() {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplace.uid).subscribe((report) => {
        this.overallWdfEligibility = report.wdf.overall;
      }),
    );
  }

  public navigateToStaffRecords(event: Event): void {
    event.preventDefault();
    this.tabsService.selectedTab = 'staff-records';
  }
}
