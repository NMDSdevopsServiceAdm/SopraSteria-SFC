import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-and-qualifications-tab',
  templateUrl: './training-and-qualifications-tab.component.html',
})
export class TrainingAndQualificationsTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

  private subscriptions: Subscription = new Subscription();
  public workers: Worker[];
  public totalRecords;
  public totalExpiredTraining;
  public totalExpiringTraining;
  public totalStaff: number;
  constructor(private workerService: WorkerService, private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe(
        workers => {
          this.workers = workers;
          this.totalRecords = 0;
          this.totalExpiredTraining = 0;
          this.totalExpiringTraining = 0;
          this.workers.forEach((worker: Worker) => {
            this.totalRecords += worker.trainingCount + worker.qualificationCount;
            this.totalExpiredTraining += worker.expiredTrainingCount;
            this.totalExpiringTraining += worker.expiringTrainingCount;
          });
        },
        error => {
          console.error(error.error);
        }
      )
    );
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
