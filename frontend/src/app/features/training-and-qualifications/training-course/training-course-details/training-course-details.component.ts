import { Subscription } from 'rxjs';

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { NumberInputWithButtonsComponent } from '@shared/components/number-input-with-buttons/number-input-with-buttons.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Component({
  selector: 'app-training-course-details',
  templateUrl: './training-course-details.component.html',
  styleUrl: './training-course-details.component.scss',
})
export class TrainingCourseDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('validityPeriodInMonthRef') validityPeriodInMonth: NumberInputWithButtonsComponent;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  public accreditedOptions = YesNoDontKnowOptions;
  public deliveredByOptions = DeliveredBy;
  public howWasItDeliveredOptions = HowWasItDelivered;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingCourseService: TrainingCourseService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.setupForm();
    this.setupFormErrorsMap();
    this.backLinkService.showBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
    this.validityPeriodInMonth.registerOnChange((newValue) => this.handleValidityPeriodChange(newValue));
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        name: [null, { validators: [Validators.required] }],
        accredited: null,
        deliveredBy: [null, { updateOn: 'change' }],
        externalProviderName: null,
        howWasItDelivered: null,
        validityPeriodInMonth: [null],
        doesNotExpire: null,
      },
      {
        validators: [CustomValidators.crossCheckTrainingCourseValidityPeriod()],
        updateOn: 'submit',
      },
    );
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'name',
        type: [{ name: 'required', message: 'Enter the training course name' }],
      },
      {
        item: 'validityPeriodInMonth',
        type: [{ name: 'required', message: 'Enter the number of months or select this training does not expire' }],
      },
    ];
  }

  public handleValidityPeriodChange(newValue: string | number): void {
    if (Number(newValue) > 0) {
      this.form.patchValue({ doesNotExpire: null });
    }
  }

  public handleDoesNotExpireChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.form.patchValue({ validityPeriodInMonth: null });
    }
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit() {
    this.submitted = true;

    if (!this.form.valid) {
      return;
    }

    this.storeDetailsAndContinueToNextPage();
  }

  private storeDetailsAndContinueToNextPage() {
    const newTrainingCourseToBeAdded = this.form.value;

    this.trainingCourseService.newTrainingCourseToBeAdded = newTrainingCourseToBeAdded;
    this.router.navigate(['../select-category'], { relativeTo: this.route });
  }
}
