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
    this.setVariables();
    this.trainingPageUrl = `workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}`;
    this.setBackLink();
  }

  private setVariables(): void {
    this.workplace = this.route.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    this.trainingRecord = this.route.snapshot.data.trainingRecord;
  }

  private setBackLink(): void {
    this.backService.setBackLink({
      url: [this.trainingPageUrl, 'training', this.trainingRecord.uid],
    });
  }

  public returnToEditPage(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.trainingPageUrl, 'training', this.trainingRecord.uid]);
  }

  public deleteRecord(): void {
    this.subscriptions.add(
      this.workerService
        .deleteTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecord.uid)
        .subscribe(() => {
          this.router.navigate([this.trainingPageUrl, 'new-training']);

          this.alertService.addAlert({
            type: 'success',
            message: 'Training record has been deleted',
          });
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
