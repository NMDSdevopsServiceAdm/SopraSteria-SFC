import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { QualificationResponse } from '@core/model/qualification.model';
import { TrainingRecord } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
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
  public trainingView: boolean;
  private trainingPageUrl: string;
  private recordUid: string;
  private subscriptions: Subscription = new Subscription();
  public previousUrl: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private alertService: AlertService,
    protected backLinkService: BackLinkService,
  ) {}

  ngOnInit(): void {
    this.setTrainingView();
    this.setVariables();
    this.previousUrl = [localStorage.getItem('previousUrl')];

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

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public returnToEditPage(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.trainingPageUrl, this.trainingOrQualification, this.recordUid]);
  }

  public deleteRecord(): void {
    const message = `${this.capitalizeFirstLetter(this.trainingOrQualification)} record deleted`;
    this.subscriptions.add(
      this.deleteTrainingOrQualificationRecord().subscribe(() => {
        this.router.navigate(this.previousUrl, { state: { alertMessage: message } });
      }),
    );
  }

  private deleteTrainingOrQualificationRecord() {
    if (this.trainingView) {
      return this.workerService.deleteTrainingRecord(this.workplace.uid, this.worker.uid, this.recordUid);
    }
    return this.workerService.deleteQualification(this.workplace.uid, this.worker.uid, this.recordUid);
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    localStorage.removeItem('previousUrl');
  }
}
