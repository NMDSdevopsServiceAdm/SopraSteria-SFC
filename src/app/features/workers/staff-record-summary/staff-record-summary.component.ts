import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-staff-record-summary',
  templateUrl: './staff-record-summary.component.html',
})
export class StaffRecordSummaryComponent {
  @Input() worker: Worker;
  @Input() return: string[] = null;

  constructor(private location: Location, public workerService: WorkerService) {}

  goBack(event) {
    event.preventDefault();

    this.location.back();
  }

  setReturn() {
    console.log(this.return);
    this.workerService.setReturnTo(this.return);
  }
}
