import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-total-staff-panel',
  templateUrl: './total-staff-panel.component.html',
})
export class TotalStaffPanelComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() totalStaff = 0;
  @Input() totalWorkers = 0;
  @Input() returnToDash = false;
  public canEdit: boolean;

  constructor(private permissionsService: PermissionsService, private workerService: WorkerService) {}

  ngOnInit() {
    this.canEdit = this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
  }

  setReturn() {
    this.workerService.setTotalStaffReturn(this.returnToDash);
  }
}
