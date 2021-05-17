import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-staff-records-tab',
  templateUrl: './staff-records-tab.component.html',
})
export class StaffRecordsTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];

  private subscriptions: Subscription = new Subscription();
  public createStaffResponse = null;
  public errors;
  public canAddWorker: boolean;

  constructor(private permissionsService: PermissionsService, private workerService: WorkerService) {}

  ngOnInit(): void {
    this.createStaffResponse = this.workerService.getCreateStaffResponse();
    this.subscriptions.add(
      this.permissionsService.getPermissions(this.workplace.uid).subscribe((hasPermissions) => {
        if (hasPermissions && hasPermissions.permissions) {
          this.permissionsService.setPermissions(this.workplace.uid, hasPermissions.permissions);
          this.canAddWorker = this.permissionsService.can(this.workplace.uid, 'canAddWorker');
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
