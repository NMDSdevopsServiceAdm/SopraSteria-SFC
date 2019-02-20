import { Component, OnDestroy } from '@angular/core';
import { WorkerService } from '@core/services/worker.service';

@Component({
  templateUrl: './edit-worker.component.html',
})
export class EditWorkerComponent implements OnDestroy {
  constructor(private workerService: WorkerService) {}

  ngOnDestroy() {
    this.workerService.workerId = null;
  }
}
