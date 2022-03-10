import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Alert } from '@core/model/alert.model';
import { MultipleTrainingResponse, TrainingRecordRequest } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';

import { AddEditTrainingDirective } from '../../../shared/directives/add-edit-training/add-edit-training.directive';

@Component({
  selector: 'app-add-edit-training',
  templateUrl: '../../../shared/directives/add-edit-training/add-edit-training.component.html',
})
export class MultipleTrainingDetailsComponent extends AddEditTrainingDirective implements OnInit, AfterViewInit {
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
    private establishmentService: EstablishmentService,
    private alertService: AlertService,
  ) {
    super(formBuilder, route, router, backService, errorSummaryService, trainingService, workerService);
  }

  protected init(): void {
    this.previousUrl =
      this.establishmentService.primaryWorkplace?.uid === this.workplace.uid
        ? ['/dashboard']
        : ['workplace', this.workplace.uid];
  }

  protected setTitle(): void {
    this.title = 'Add training details';
  }

  protected setButtonText(): void {
    this.buttonText = 'Finish';
  }

  protected setBackLink(): void {
    this.backService.setBackLink({
      url: ['workplace', this.workplace.uid, 'add-multiple-training', 'select-staff'],
    });
  }

  protected submit(record: TrainingRecordRequest): void {
    this.subscriptions.add(
      this.workerService
        .createMultipleTrainingRecords(this.workplace.uid, this.trainingService.selectedStaff, record)
        .subscribe(
          (response: MultipleTrainingResponse) => this.onSuccess(response),
          (error) => this.onError(error),
        ),
    );
  }

  private async onSuccess(response: MultipleTrainingResponse) {
    this.trainingService.resetSelectedStaff();
    this.trainingService.addMultipleTrainingInProgress$.next(false);

    await this.router.navigate(this.previousUrl, { fragment: 'training-and-qualifications' });
    this.alertService.addAlert({
      type: 'success',
      message: `Training records have been added for ${response.savedRecords} staff`,
    } as Alert);
  }

  private onError(error) {
    console.error(error);
  }

  public onCancel(): void {
    this.trainingService.resetSelectedStaff();
    this.router.navigate(this.previousUrl, { fragment: 'training-and-qualifications' });
  }
}
