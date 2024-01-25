import { I18nPluralPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-total-staff-panel',
  templateUrl: './total-staff-panel.component.html',
  providers: [I18nPluralPipe],
})
export class TotalStaffPanelComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() totalStaff = 0;
  @Input() totalWorkers = 0;
  @Input() returnToDash = false;
  public canEditEstablishment: boolean;

  constructor(private permissionsService: PermissionsService, private workerService: WorkerService) {}

  ngOnInit(): void {
    this.canEditEstablishment = this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
  }

  setReturn(): void {
    this.workerService.setTotalStaffReturn(this.returnToDash);
  }
}
