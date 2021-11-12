import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecord } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-record',
  templateUrl: './delete-record.component.html',
})
export class DeleteRecordComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public worker: Worker;
  public trainingRecord: TrainingRecord;
  public trainingRecordId: string;
  private trainingPageUrl: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private backService: BackService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.snapshot.data.establishment;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    this.worker = this.route.snapshot.data.worker;
    this.trainingPageUrl = `workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}`;
    this.getTrainingRecord();
    this.setBackLink();
  }

  private getTrainingRecord(): void {
    this.subscriptions.add(
      this.workerService
        .getTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId)
        .subscribe((trainingRecord) => {
          if (trainingRecord) {
            this.trainingRecord = trainingRecord;
          }
        }),
    );
  }

  private setBackLink(): void {
    this.backService.setBackLink({
      url: [this.trainingPageUrl, 'training', this.trainingRecordId],
    });
  }

  public returnToEditPage(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.trainingPageUrl, 'training', this.trainingRecordId]);
  }

  public deleteRecord(): void {
    this.workerService
      .deleteTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId)
      .subscribe(() => {
        this.router.navigate([this.trainingPageUrl, 'new-training']);

        this.alertService.addAlert({
          type: 'success',
          message: 'Training record has been deleted',
        });
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
