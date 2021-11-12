import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { QualificationResponse } from '@core/model/qualification.model';
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
  public qualificationRecord: QualificationResponse;
  public trainingOrQualification: string;
  private trainingPageUrl: string;
  private trainingView: boolean;
  private recordUid: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private backService: BackService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.setTrainingView();
    this.setVariables();
    this.trainingPageUrl = `workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}`;
    this.setBackLink();
  }

  private setTrainingView(): void {
    this.trainingView = this.route.snapshot.data.trainingRecord ? true : false;
    this.trainingOrQualification = this.trainingView ? 'training' : 'qualification';
    if (this.trainingView) {
      this.trainingRecord = this.route.snapshot.data.trainingRecord;
      this.recordUid = this.trainingRecord.uid;
    } else {
      this.qualificationRecord = this.route.snapshot.data.qualificationRecord;
      this.recordUid = this.qualificationRecord.uid;
    }
  }

  private setVariables(): void {
    this.workplace = this.route.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
  }

  private setBackLink(): void {
    this.backService.setBackLink({
      url: [this.trainingPageUrl, this.trainingOrQualification, this.recordUid],
    });
  }

  public returnToEditPage(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.trainingPageUrl, this.trainingOrQualification, this.recordUid]);
  }

  public deleteRecord(): void {
    this.subscriptions.add(
      this.workerService.deleteTrainingRecord(this.workplace.uid, this.worker.uid, this.recordUid).subscribe(() => {
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
