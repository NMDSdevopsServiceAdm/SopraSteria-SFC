import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-new-staff-tab',
  templateUrl: './staff-tab.component.html',
})
export class NewStaffTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];
  @Input() workerCount: number;
  @Input() staffLastUpdated: string;

  public canAddWorker: boolean;
  public alertMessage: string;
  public workplaceUid: string;

  constructor(
    private permissionsService: PermissionsService,
    private workerService: WorkerService,
    private breadcrumbService: BreadcrumbService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.workerService.setAddStaffRecordInProgress(false);
    this.canAddWorker = this.permissionsService.can(this.workplace.uid, 'canAddWorker');
    this.breadcrumbService.show(JourneyType.STAFF_RECORDS_TAB, this.workplace.name);
    this.alertMessage = history.state?.alertMessage;
    this.showAlert();
  }

  private showAlert(): void {
    if (this.alertMessage) {
      this.alertService.addAlert({
        type: 'success',
        message: this.alertMessage,
      });
    }
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
    this.alertService.removeAlert();
  }
}
