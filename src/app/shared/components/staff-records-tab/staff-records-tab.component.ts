import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-staff-records-tab',
  templateUrl: './staff-records-tab.component.html',
})
export class StaffRecordsTabComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];
  @Input() workerCount: number;

  public createStaffResponse = null;
  public errors;
  public canAddWorker: boolean;

  constructor(private permissionsService: PermissionsService, private workerService: WorkerService) {}

  ngOnInit(): void {
    this.workerService.setAddStaffRecordInProgress(false);
    this.createStaffResponse = this.workerService.getCreateStaffResponse();
    this.canAddWorker = this.permissionsService.can(this.workplace.uid, 'canAddWorker');
  }

  public addStaffRecordInProgress(event: Event): void {
    event.preventDefault();
    this.workerService.setAddStaffRecordInProgress(true);
  }
}
