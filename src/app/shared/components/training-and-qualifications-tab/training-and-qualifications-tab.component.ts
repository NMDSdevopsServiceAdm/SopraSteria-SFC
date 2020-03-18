import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';

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
  public missingMandatoryTraining;
  public totalStaff: number;
  public isShowAllTrainings: boolean;
  constructor(private workerService: WorkerService, protected establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.establishmentService.isMandatoryTrainingView.next(false);
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe(
        workers => {
          this.workers = workers;
          this.totalRecords = 0;
          this.totalExpiredTraining = 0;
          this.totalExpiringTraining = 0;
          this.missingMandatoryTraining = 0;
          this.workers.forEach((worker: Worker) => {
            let totalTrainingRecord = worker.trainingCount - worker.missingMandatoryTrainingCount;
            this.totalRecords += totalTrainingRecord + worker.qualificationCount;
            this.totalExpiredTraining += worker.expiredTrainingCount;
            this.totalExpiringTraining += worker.expiringTrainingCount;
            this.missingMandatoryTraining += worker.missingMandatoryTrainingCount;
          });
        },
        error => {
          console.error(error.error);
        },
      ),
    );
  }

  public showAllTrainings() {
    this.isShowAllTrainings = true;
    this.missingMandatoryTraining = 0;
    this.totalExpiredTraining = 0;
    this.totalExpiringTraining = 0;
  }

  public mandatoryTrainingChangedHandler($event) {
    this.missingMandatoryTraining = $event;
    this.totalExpiredTraining = 0;
    this.totalExpiringTraining = 0;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
