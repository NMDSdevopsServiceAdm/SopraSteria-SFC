import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-training-and-qualifications-categories-view',
  templateUrl: './view-trainings.component.html',
})
export class ViewTrainingAndQualifications implements OnInit {
  public canEditWorker: boolean;
  public canViewWorker: boolean;
  public worker: Worker;
  public workplace: Establishment;
  public trainingAndQualsCount: number;
  public trainingAlert: number;
  public qualificationsCount: number;
  public mandatoryTrainingCount: number;
  public nonMandatoryTrainingCount: number;
  public nonMandatoryTraining: TrainingRecordCategory[];
  public mandatoryTraining: TrainingRecordCategory[];
  public expiredTraining: number;
  public expiresSoonTraining: number;
  public lastUpdatedDate: Date;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private trainingStatusService: TrainingStatusService,
  ) {}

  ngOnInit() {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    this.trainingStatusService.expiresSoonAlertDate$.next(
      this.route.snapshot.data.expiresSoonAlertDate.expiresSoonAlertDate,
    );
  }

  public updateTrainingRecord(event, training): void {
    event.preventDefault();
    this.workerService.getRoute$.next('/dashboard?view=categories#training-and-qualifications');

    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      training.worker.uid,
      'training',
      training.uid,
    ]);
  }

  public trainingIsComplete(training) {
    return (
      [
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.EXPIRED),
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.EXPIRING),
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.MISSING),
      ].reduce((total, num) => {
        return total + num;
      }) === 0
    );
  }

  public trainingStatus(training) {
    return this.trainingStatusService.trainingStatusForRecord(training);
  }
}
