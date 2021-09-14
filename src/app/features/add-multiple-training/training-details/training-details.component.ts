import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingRecordRequest } from '@core/model/training.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';

import { AddEditTrainingDirective } from '../../../shared/directives/add-edit-training/add-edit-training.directive';

@Component({
  selector: 'app-add-edit-training',
  templateUrl: '../../../shared/directives/add-edit-training/add-edit-training.component.html',
})
export class MultipleTrainingDetailsComponent extends AddEditTrainingDirective implements OnInit {
  public showWorkerCount = true;
  public workerCount: number = this.trainingService.selectedStaff.length;

  constructor(
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
  ) {
    super(formBuilder, route, router, backService, errorSummaryService, trainingService, workerService);
  }

  protected init(): void {
    this.previousUrl = '/dashboard';
  }

  protected setTitle(): void {
    this.title = 'Add training details';
  }

  protected setButtonText(): void {
    this.buttonText = 'Finish';
  }

  protected setBackLink(): void {}

  protected submit(record: TrainingRecordRequest): void {
    this.subscriptions.add(
      this.workerService
        .createMultipleTrainingRecords(this.workplace.uid, this.trainingService.selectedStaff, record)
        .subscribe(
          () => this.onSuccess(),
          (error) => this.onError(error),
        ),
    );
  }

  private onSuccess() {
    this.trainingService.addMultipleTrainingInProgress$.next(false);
    let url = '';
    if (this.previousUrl.indexOf('dashboard') > -1) {
      url = this.previousUrl;
    } else {
      url = `/workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}/training`;
    }
    this.router.navigateByUrl(url).then(() => {
      if (this.trainingRecordId) {
        this.workerService.alert = { type: 'success', message: 'Training has been saved.' };
      } else {
        this.workerService.alert = { type: 'success', message: 'Training has been added.' };
      }
    });
  }

  private onError(error) {
    console.log(error);
  }
}
