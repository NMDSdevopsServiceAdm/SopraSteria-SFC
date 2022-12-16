import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingRecordRequest } from '@core/model/training.model';
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
  private accessedFromSummary = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    public trainingService: TrainingService,
    protected workerService: WorkerService,
    private establishmentService: EstablishmentService,
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
    this.accessedFromSummary = this.route.snapshot.parent.url[0].path.includes('confirm-training');
  }

  // public setReturnLink(): void {
  //   this.previousUrl =
  //     this.workplaceUid === this.primaryWorkplaceUid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
  // }

  protected setSection(): void {
    this.section = 'Add multiple records';
  }

  protected setTitle(): void {
    this.title = 'Add training record details';
  }

  protected prefill(): void {
    if (this.trainingService.selectedTraining) {
      const { accredited, trainingCategory, completed, expires, notes, title } = this.trainingService.selectedTraining;
      const completedArr = completed?.split('-');
      const expiresArr = expires?.split('-');
      this.form.patchValue({
        accredited,
        completed: completedArr && {
          day: +completedArr[2],
          month: +completedArr[1],
          year: +completedArr[0],
        },
        expires: expiresArr && {
          day: +expiresArr[2],
          month: +expiresArr[1],
          year: +expiresArr[0],
        },
        notes,
        title,
        category: trainingCategory.id,
      });
    }
  }

  protected setButtonText(): void {
    this.buttonText = this.accessedFromSummary ? 'Save and return' : 'Continue';
  }

  protected submit(record: TrainingRecordRequest): void {
    const trainingCategory = this.categories.find((category) => category.id === record.trainingCategory.id);
    this.trainingService.updateSelectedTraining({ ...record, trainingCategory });

    this.router.navigate(['workplace', this.workplace.uid, 'add-multiple-training', 'confirm-training']);
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    if (this.accessedFromSummary) {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.trainingService.resetState();
      this.router.navigate(this.previousUrl, { fragment: 'training-and-qualifications' });
    }
  }
}
