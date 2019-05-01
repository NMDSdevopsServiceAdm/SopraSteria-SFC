import { Component, Input } from '@angular/core';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-total-staff-panel',
  templateUrl: './total-staff-panel.component.html',
  styleUrls: ['./total-staff-panel.component.scss'],
})
export class TotalStaffPanelComponent {
  @Input() totalStaff = 0;
  @Input() totalWorkers = 0;
  @Input() returnToDash = false;

  constructor(private workerService: WorkerService) {}

  setReturn() {
    this.workerService.setTotalStaffReturn(this.returnToDash);
  }
}
