import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { WorkerService } from '@core/services/worker.service';

@Component({
  templateUrl: './edit-worker.component.html',
})
export class EditWorkerComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  constructor(private route: ActivatedRoute, private workerService: WorkerService) {}

  ngOnInit() {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.workerService.setState(this.route.snapshot.data.worker);
  }

  ngOnDestroy(): void {
    this.workerService.setState(null);
    this.workerService.setReturnTo(null);
  }
}
