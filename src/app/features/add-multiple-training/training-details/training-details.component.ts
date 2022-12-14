import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MultipleTrainingResponse, TrainingRecordRequest } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
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
    public backLinkService: BackLinkService,
  ) {
    super(
      formBuilder,
      route,
      router,
      backService,
      errorSummaryService,
      trainingService,
      workerService,
      backLinkService,
    );
  }

  protected init(): void {
    this.previousUrl =
      this.establishmentService.primaryWorkplace?.uid === this.workplace.uid
        ? ['/dashboard']
        : ['workplace', this.workplace.uid];
  }

  protected setSection(): void {
    this.section = 'Add multiple records';
  }

  protected setTitle(): void {
    this.title = 'Add training record details';
  }

  protected setButtonText(): void {
    this.buttonText = 'Continue';
  }

  protected async submit(record: TrainingRecordRequest) {
    this.trainingService.updateSelectedTraining(record);

    await this.router.navigate(['workplace', this.workplace.uid, 'add-multiple-training', 'confirm-training']);
  }

  private onError(error) {
    console.error(error);
  }

  public onCancel(): void {
    this.trainingService.resetSelectedStaff();
    this.router.navigate(this.previousUrl, { fragment: 'training-and-qualifications' });
  }
}
