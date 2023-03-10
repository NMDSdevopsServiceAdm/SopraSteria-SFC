import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-new-staff-tab',
  templateUrl: './staff-tab.component.html',
})
export class NewStaffTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];
  @Input() workerCount: number;

  public canAddWorker: boolean;

  constructor(
    private permissionsService: PermissionsService,
    private workerService: WorkerService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.workerService.setAddStaffRecordInProgress(false);
    this.canAddWorker = this.permissionsService.can(this.workplace.uid, 'canAddWorker');
    this.breadcrumbService.show(JourneyType.STAFF_RECORDS_TAB);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }
}
