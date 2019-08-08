import { Component, Input } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-total-staff-panel',
  templateUrl: './total-staff-panel.component.html',
})
export class TotalStaffPanelComponent {
  @Input() workplace: Establishment;
  @Input() totalStaff = 0;
  @Input() totalWorkers = 0;
  @Input() returnToDash = false;
  public canEdit: boolean;

  constructor(private userService: UserService, private workerService: WorkerService) {
    this.canEdit = this.userService.loggedInUser.role === (Roles.Edit || Roles.Admin);
  }

  setReturn() {
    this.workerService.setTotalStaffReturn(this.returnToDash);
  }
}
