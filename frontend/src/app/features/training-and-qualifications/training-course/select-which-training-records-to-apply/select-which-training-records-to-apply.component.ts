import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCourseService } from '@core/services/training-course.service';

enum TrainingRecordsToApply {
  OnlyNew = 'OnlyNew',
  ExistingAndNew = 'ExistingAndNew',
}
const radioButtonOptions = [
  {
    value: TrainingRecordsToApply.OnlyNew,
    label: 'Only apply the updated course details to NEW training records that you add in the future',
  },
  {
    value: TrainingRecordsToApply.ExistingAndNew,
    label: 'Apply the updated course details to EXISTING and NEW training records',
  },
];

@Component({
  selector: 'app-select-which-training-records-to-apply',
  templateUrl: './select-which-training-records-to-apply.component.html',
})
export class SelectWhichTrainingRecordsToApplyComponent {
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted: boolean = false;
  private workplace: Establishment;
  public radioButtonOptions = radioButtonOptions;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected alertService: AlertService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingCourseService: TrainingCourseService,
  ) {
    this.loadTrainingCourseToUpdate();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  private loadTrainingCourseToUpdate() {}

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm() {
    this.form = this.formBuilder.group(
      {
        trainingRecordsToApply: [null],
      },
      {
        updateOn: 'submit',
      },
    );
  }

  private setupFormErrorsMap() {}

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onSubmit() {}
}
