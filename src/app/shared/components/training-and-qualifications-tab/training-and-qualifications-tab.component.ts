import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-training-and-qualifications-tab',
  templateUrl: './training-and-qualifications-tab.component.html',
})
export class TrainingAndQualificationsTabComponent implements OnInit {
  @Input() workplace: Establishment;

  private subscriptions: Subscription = new Subscription();
  public workers: Worker[];
  constructor(private workerService: WorkerService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.workerService.workers$.pipe(filter(workers => workers !== null)).subscribe(workers => {
        this.workers = workers;
      })
    );
  }
}
