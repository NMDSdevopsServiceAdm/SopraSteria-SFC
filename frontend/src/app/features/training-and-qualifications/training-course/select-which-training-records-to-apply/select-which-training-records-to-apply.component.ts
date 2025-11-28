import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
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
  standalone: false,
})
export class SelectWhichTrainingRecordsToApplyComponent {
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted: boolean = false;
  private workplace: Establishment;
  public radioButtonOptions = radioButtonOptions;
  public updates: Partial<TrainingCourse>;
  public trainingCourseUid: string;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected alertService: AlertService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingCourseService: TrainingCourseService,
  ) {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.loadTrainingCourseToUpdate();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  private loadTrainingCourseToUpdate() {
    this.trainingCourseUid = this.route.snapshot.params.trainingCourseUid;
    this.updates = this.trainingCourseService.trainingCourseToBeUpdated;
    if (!this.updates) {
      this.router.navigate(['../details'], { relativeTo: this.route });
    }
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm() {
    this.form = this.formBuilder.group(
      {
        trainingRecordsToApply: [null, Validators.required],
      },
      {
        updateOn: 'submit',
      },
    );
  }

  private setupFormErrorsMap() {
    this.formErrorsMap = [
      {
        item: 'trainingRecordsToApply',
        type: [
          {
            name: 'required',
            message: 'Select which training records you want the details to apply to',
          },
        ],
      },
    ];
  }

  public get trainingRecordsToApply() {
    return this.form.get('trainingRecordsToApply');
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setBackLink(): void {
    setTimeout(() => {
      this.backLinkService.showBackLink();
    }, 0);
  }

  public onSubmit() {
    this.submitted = true;

    if (this.form.invalid || !this.updates) {
      return;
    }

    const shouldUpdateExistingRecords = this.trainingRecordsToApply.value === TrainingRecordsToApply.ExistingAndNew;

    this.trainingCourseService
      .updateTrainingCourse(this.workplace.uid, this.trainingCourseUid, this.updates, shouldUpdateExistingRecords)
      .subscribe(() => {
        this.navigateAndShowAlert();
      });
  }

  private navigateAndShowAlert() {
    const updateExistingRecords = this.trainingRecordsToApply.value === TrainingRecordsToApply.ExistingAndNew;
    const applyToWhich = updateExistingRecords ? 'EXISTING and NEW' : 'NEW';
    const alertMessage = `Course details updated and will apply to ${applyToWhich} training records`;

    this.router.navigate(['../../add-and-manage-training-courses'], { relativeTo: this.route }).then(() => {
      this.alertService.addAlert({ type: 'success', message: alertMessage });
    });
  }
}
