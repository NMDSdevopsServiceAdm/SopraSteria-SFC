import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { WorkerService } from '@core/services/worker.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-view-subsidiary-staff-records',
  templateUrl: './view-subsidiary-staff-records.component.html',
})
export class ViewSubsidiaryStaffRecordsComponent implements OnInit {
  public workplace: Establishment;
  public workers: Worker[];
  public workerCount: number;
  public createStaffResponse = null;
  public errors;
  public canAddWorker: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private permissionsService: PermissionsService,
    private workerService: WorkerService,
    private route: ActivatedRoute,
    private tabsService: TabsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.workerService.setAddStaffRecordInProgress(false);
    this.createStaffResponse = this.workerService.getCreateStaffResponse();

    this.workers = this.route.snapshot.data.workers?.workers;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;

    this.workplace = this.route.snapshot.data.establishment;
    this.canAddWorker = this.permissionsService.can(this.workplace.uid, 'canAddWorker');
  }
}
