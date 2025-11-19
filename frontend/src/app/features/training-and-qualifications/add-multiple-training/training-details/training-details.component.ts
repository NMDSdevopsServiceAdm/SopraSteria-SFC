import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingRecordRequest } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { AddEditTrainingDirective } from '../../../../shared/directives/add-edit-training/add-edit-training.directive';
import { TrainingCategoryService } from '@core/services/training-category.service';

@Component({
  selector: 'app-add-edit-training',
  templateUrl: '../../../../shared/directives/add-edit-training/add-edit-training.component.html',
})
export class MultipleTrainingDetailsComponent extends AddEditTrainingDirective implements OnInit, AfterViewInit {
  public showWorkerCount = true;
  public showCategory = true;
  public workerCount: number = this.trainingService.selectedStaff.length;
  private accessedFromSummary = false;
  public category: string;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    public trainingService: TrainingService,
    protected trainingCategoryService: TrainingCategoryService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
    private establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      route,
      router,
      backLinkService,
      errorSummaryService,
      trainingService,
      trainingCategoryService,
      workerService,
      alertService,
    );
  }

  protected init(): void {
    this.multipleTrainingDetails = true;
    this.previousUrl = ['/dashboard'];
    this.accessedFromSummary = this.route.snapshot.parent.url[0].path.includes('confirm-training');

    if (this.trainingCategory) {
      this.category = this.trainingCategory.category;
    }

    this.checkAccessFromSummaryAndHideElements();
    this.hideExpiresDate = true;
  }

  protected setTitle(): void {
    this.title = 'Add training record details';
  }

  protected setSectionHeading(): void {
    this.section = 'Add multiple training records';
  }

  protected prefill(): void {
    if (this.trainingService.selectedTraining) {
      const {
        accredited,
        trainingCategory,
        completed,
        expires,
        notes,
        title,
        deliveredBy,
        externalProviderName,
        howWasItDelivered,
        validityPeriodInMonth,
        doesNotExpire,
      } = this.trainingService.selectedTraining;
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
        deliveredBy,
        externalProviderName,
        howWasItDelivered,
        validityPeriodInMonth: validityPeriodInMonth ? validityPeriodInMonth : null,
        doesNotExpire: doesNotExpire ? doesNotExpire : null,
      });
      if (notes?.length > 0) {
        this.notesOpen = true;
        this.remainingCharacterCount = this.notesMaxLength - notes.length;
      }
    }
  }

  protected setButtonText(): void {
    this.buttonText = this.accessedFromSummary ? 'Save and return' : 'Continue';
  }

  protected checkAccessFromSummaryAndHideElements(): void {
    if (this.accessedFromSummary) {
      this.showWorkerCount = false;
      this.showCategory = false;
    }
  }

  protected submit(record: TrainingRecordRequest): void {
    const trainingCategory = this.categories.find((category) => category.id === record.trainingCategory.id);
    this.trainingService.selectedTraining = { ...record, trainingCategory };
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

  public setIsSelectStaffChange(): void {
    this.trainingService.setUpdatingSelectedStaffForMultipleTraining(true);
  }
}
