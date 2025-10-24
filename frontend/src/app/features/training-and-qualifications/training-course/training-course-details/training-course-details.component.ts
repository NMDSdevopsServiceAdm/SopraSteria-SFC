import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { NumberInputWithButtonsComponent } from '@shared/components/number-input-with-buttons/number-input-with-buttons.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

type JourneyType = 'Add' | 'Edit';

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
  public isAddingNewTrainingCourse: boolean;
  public journeyType: JourneyType;
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
    this.determineJourneyType();
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefill();
    this.backLinkService.showBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
    this.validityPeriodInMonth.registerOnChange((newValue) => this.handleValidityPeriodChange(newValue));
  }

  private determineJourneyType() {
    this.journeyType = this.route.snapshot?.data?.journeyType ?? 'Add';
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        name: [null, { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)] }],
        accredited: null,
        deliveredBy: [null, { updateOn: 'change' }],
        externalProviderName: null,
        howWasItDelivered: null,
        validityPeriodInMonth: null,
        doesNotExpire: null,
      },
      {
        updateOn: 'submit',
      },
    );

    this.subscriptions.add(
      this.form.get('deliveredBy').valueChanges.subscribe((newValue) => {
        if (newValue !== this.deliveredByOptions.ExternalProvider) {
          this.form.patchValue({ externalProviderName: null });
        }
      }),
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'name',
        type: [
          { name: 'required', message: 'Enter the training course name' },
          { name: 'maxlength', message: 'Training course name must be between 3 and 120 characters' },
          { name: 'minlength', message: 'Training course name must be between 3 and 120 characters' },
        ],
      },
      {
        item: 'validityPeriodInMonth',
        type: [
          { name: 'required', message: 'Enter the number of months' },
          { name: 'pattern', message: 'Number of months must be between 1 and 999' },
        ],
      },
      {
        item: 'doesNotExpire',
        type: [{ name: 'required', message: 'Confirm the training does not expire' }],
      },
    ];
  }

  private prefill(): void {
    if (this.journeyType === 'Add' && this.trainingCourseService.newTrainingCourseToBeAdded) {
      this.prefillFromLocalData();
    }
  }

  private prefillFromLocalData() {
    const data = this.trainingCourseService.newTrainingCourseToBeAdded;
    this.form.patchValue(data);
  }

  public handleValidityPeriodChange(newValue: string | number): void {
    if (newValue && newValue !== '') {
      this.clearFormControlAndKeepErrorMessages('doesNotExpire');
    }
  }

  public handleDoesNotExpireChange(event: Event): void {
    const checkboxTicked = (event.target as HTMLInputElement).checked;
    if (checkboxTicked) {
      this.clearFormControlAndKeepErrorMessages('validityPeriodInMonth');
    }
  }

  private clearFormControlAndKeepErrorMessages(formControlName: string): void {
    const formControl = this.form.get(formControlName);
    const existingErrors = formControl.errors;
    formControl.patchValue(null);
    formControl.setErrors(existingErrors);
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private runCrossValidation(): void {
    // manually run the cross validation and remove the validator right afterward,
    // to avoid side effects from the interaction between validityPeriodInMonth and doesNotExpire
    this.form.setValidators([CustomValidators.crossCheckTrainingCourseValidityPeriod()]);
    this.form.updateValueAndValidity();
    this.form.clearValidators();
  }

  public onSubmit() {
    this.submitted = true;
    this.runCrossValidation();

    if (!this.form.valid) {
      return;
    }

    if (this.journeyType === 'Add') {
      this.storeDetailsAndContinueToNextPage();
    }
  }

  private storeDetailsAndContinueToNextPage() {
    const newTrainingCourseToBeAdded = this.form.value;

    this.trainingCourseService.newTrainingCourseToBeAdded = newTrainingCourseToBeAdded;
    this.clearLocalTrainingCourseDataWhenClickedAway();

    this.router.navigate(['../select-category'], { relativeTo: this.route });
  }

  private clearLocalTrainingCourseDataWhenClickedAway(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => !event.urlAfterRedirects?.includes('add-training-course')),
        take(1),
      )
      .subscribe(() => {
        this.trainingCourseService.newTrainingCourseToBeAdded = null;
      });
  }
}
