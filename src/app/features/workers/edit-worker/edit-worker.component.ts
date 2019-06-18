import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportsService } from '@core/services/reports.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  templateUrl: './edit-worker.component.html',
})
export class EditWorkerComponent implements OnInit, OnDestroy {
  public reportDetails: {};

  constructor(
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.workerService.setState(this.route.snapshot.data.worker);
  }

  ngOnDestroy(): void {
    this.workerService.setState(null);
    this.workerService.setReturnTo(null);
    this.reportsService.updateState(null);
  }
}
