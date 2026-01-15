/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import { TrainingProvider } from '@core/model/training-provider.model';
import {
  DeliveredBy,
  HowWasItDelivered,
  TrainingCategory,
  TrainingCertificate,
  TrainingRecord as LegacyIncorrectTrainingRecordType,
  TrainingRecordRequest,
} from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { TrainingProviderService } from '@core/services/training-provider.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { DateUtil } from '@core/utils/date-util';
import { NumberInputWithButtonsComponent } from '@shared/components/number-input-with-buttons/number-input-with-buttons.component';
import { DateValidator } from '@shared/validators/date.validator';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

type TrainingRecord = LegacyIncorrectTrainingRecordType & {
  completed: string;
  expires: string;
  accredited?: YesNoDontKnow;
};

@Directive({
  standalone: false,
})
export class AddEditTrainingDirective implements OnInit, AfterViewInit {
  @ViewChild('validityPeriodInMonthRef', { static: true }) validityPeriodInMonth: NumberInputWithButtonsComponent;
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public categories: TrainingCategory[];
  public trainingRecord: TrainingRecord;
  public trainingRecordId: string;
  public trainingCategory: { id: number; category: string };
  public worker: Worker;
  public workplace: Establishment;
  public formErrorsMap: Array<ErrorDetails>;
  public notesMaxLength = 1000;
  public notesOpen = false;
  private titleMaxLength = 120;
  private titleMinLength = 3;
  public subscriptions: Subscription = new Subscription();
  public previousUrl: string[];
  public title: string;
  public section: string;
  public buttonText: string;
  public showWorkerCount = false;
  public showCategory: boolean;
  public remainingCharacterCount: number = this.notesMaxLength;
  public notesValue = '';
  public showChangeLink: boolean = false;
  public multipleTrainingDetails: boolean;
  public trainingCertificates: TrainingCertificate[] = [];
  public submitButtonDisabled: boolean = false;
  public deliveredByOptions = DeliveredBy;
  public howWasItDeliveredOptions = HowWasItDelivered;
  public hideExpiresDate: boolean = false;
  public trainingCourses: TrainingCourse[] = [];
  public showUpdateRecordsWithTrainingCourseDetails: boolean = false;
  public updateTrainingRecordWithTrainingCourseText = TrainingCourseService.RevealText;
  public trainingProviders: TrainingProvider[];
  public expiryMismatchWarning: boolean = false;
  public showExpiryDateInput: boolean = false;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected trainingCategoryService: TrainingCategoryService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
    protected trainingProviderService: TrainingProviderService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.trainingProviders = this.route.snapshot.data?.trainingProviders;
    this.checkForCategoryId();
    this.previousUrl = [localStorage.getItem('previousUrl')];
    this.setupForm();
    this.init();
    this.prefill();
    this.setTitle();
    this.setSectionHeading();
    this.setButtonText();
    this.setBackLink();
    this.getCategories();
    this.setupFormChangeListeners();
    this.setupFormErrorsMap();
    this.resetTrainingRecordsStateWhenClickedAway();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public checkForCategoryId(): void {
    const selectedCategory = this.trainingService.selectedTraining?.trainingCategory;
    if (selectedCategory) {
      this.trainingCategory = { id: selectedCategory.id, category: selectedCategory.category };
      this.showChangeLink = true;
    }
  }

  public handleOnInput(event: Event) {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }

  protected init(): void {}

  protected prefill(): void {}

  protected submit(record: any): void {}

  protected setTitle(): void {}

  protected setSectionHeading(): void {}

  protected setButtonText(): void {}

  protected resetTrainingRecordsStateWhenClickedAway(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        title: [null, [Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
        accredited: null,
        deliveredBy: [null, { updateOn: 'change' }],
        externalProviderName: [null, { updateOn: 'change' }],
        howWasItDelivered: null,
        validityPeriodInMonth: [
          null,
          {
            validators: [Validators.min(1), Validators.max(999), Validators.pattern('^[0-9]+$')],
          },
        ],
        doesNotExpire: [null, { updateOn: 'change' }],
        completed: this.formBuilder.group({
          day: null,
          month: null,
          year: null,
        }),
        expires: this.formBuilder.group({
          day: null,
          month: null,
          year: null,
        }),
        notes: [null, Validators.maxLength(this.notesMaxLength)],
      },
      { updateOn: 'submit' },
    );

    const minDate = dayjs().subtract(100, 'years');

    this.form
      .get('completed')
      .setValidators([DateValidator.dateValid(), DateValidator.todayOrBefore(), DateValidator.min(minDate)]);
    this.form
      .get('expires')
      .setValidators([
        DateValidator.dateValid(),
        DateValidator.min(minDate),
        DateValidator.beforeStartDate('completed', true, true),
      ]);
  }

  private getCategories(): void {
    this.subscriptions.add(
      this.trainingCategoryService.getCategories().subscribe(
        (categories) => {
          if (categories) {
            this.categories = categories;
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  protected setupFormChangeListeners() {
    const validityPeriodInMonth = this.form.get('validityPeriodInMonth');
    const doesNotExpire = this.form.get('doesNotExpire');

    const clearCheckboxOnValidityPeriodInput = this.validityPeriodInMonth.registerOnChange((newValue) => {
      if (newValue) {
        doesNotExpire.patchValue(null);
      }
    });

    const clearValidityPeriodOnCheckboxTicked = doesNotExpire.valueChanges.subscribe((newValue) => {
      if (newValue) {
        validityPeriodInMonth.patchValue(null);
      }
    });

    this.subscriptions.add(clearCheckboxOnValidityPeriodInput);
    this.subscriptions.add(clearValidityPeriodOnCheckboxTicked);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'title',
        type: [
          {
            name: 'minlength',
            message: `Training record name must be between ${this.titleMinLength} and ${this.titleMaxLength} characters`,
          },
          {
            name: 'maxlength',
            message: `Training record name must be between ${this.titleMinLength} and ${this.titleMaxLength} characters`,
          },
        ],
      },
      {
        item: 'validityPeriodInMonth',
        type: [
          { name: 'min', message: 'Number of months must be between 1 and 999' },
          { name: 'max', message: 'Number of months must be between 1 and 999' },
          { name: 'pattern', message: 'Number of months must be between 1 and 999' },
        ],
      },
      {
        item: 'completed',
        type: [
          {
            name: 'dateValid',
            message: 'Date completed must be a valid date',
          },
          {
            name: 'todayOrBefore',
            message: 'Date completed must be before today',
          },
          {
            name: 'dateMin',
            message: 'Date completed cannot be more than 100 years ago',
          },
        ],
      },
      {
        item: 'expires',
        type: [
          {
            name: 'dateValid',
            message: 'Expiry date must be a valid date',
          },
          {
            name: 'dateMin',
            message: 'Expiry date cannot be more than 100 years ago',
          },
          {
            name: 'beforeStartDate',
            message: 'Expiry date must be after date completed',
          },
        ],
      },
      {
        item: 'notes',
        type: [
          {
            name: 'maxlength',
            message: `Notes must be ${this.notesMaxLength} characters or fewer`,
          },
        ],
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public getOtherTrainingProviderId() {
    return this.trainingProviders?.find((provider) => provider.isOther)?.id;
  }

  public onSubmit(): void {
    this.form.get('completed').updateValueAndValidity();
    this.form.get('expires').updateValueAndValidity();

    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      if (this.form.controls.notes?.errors?.maxlength) {
        this.notesOpen = true;
      }
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const trainingRecordToSubmit = this.getAndProcessFormValue();

    this.submit(trainingRecordToSubmit);
  }

  private getAndProcessFormValue(): TrainingRecordRequest {
    const trainingCategorySelected = this.trainingCategory;

    const {
      title,
      accredited,
      deliveredBy,
      externalProviderName,
      howWasItDelivered,
      validityPeriodInMonth,
      doesNotExpire,
      completed,
      expires,
      notes,
    } = this.form.controls;

    const completedDate = DateUtil.toDayjs(completed.value);
    const expiresDate = DateUtil.toDayjs(expires.value);

    const record = {
      trainingCategory: {
        id: trainingCategorySelected.id,
      },
      title: title.value,
      accredited: accredited.value,
      deliveredBy: deliveredBy.value,
      externalProviderName: externalProviderName.value,
      howWasItDelivered: howWasItDelivered.value,
      validityPeriodInMonth: validityPeriodInMonth.value,
      doesNotExpire: doesNotExpire.value,
      completed: completedDate ? completedDate.format(DATE_PARSE_FORMAT) : null,
      expires: expiresDate ? expiresDate.format(DATE_PARSE_FORMAT) : null,
      notes: notes.value,
    };

    const withTrainingProviderFilled = this.trainingProviderService.fillInTrainingProvider(
      record,
      this.trainingProviders,
      this.getOtherTrainingProviderId(),
    ) as TrainingRecordRequest;

    if (this.multipleTrainingDetails && withTrainingProviderFilled.expires) {
      withTrainingProviderFilled.expires = null;
    }

    const withExpiryDateFilled = this.trainingService.fillInExpiryDate(withTrainingProviderFilled, completedDate);

    return withExpiryDateFilled;
  }

  // TODO: Expiry Date validation cannot be before completed date
  expiresDateValidator(group: UntypedFormGroup): ValidationErrors {
    const completed = group.get('completed') as UntypedFormGroup;
    const expires = group.get('expires') as UntypedFormGroup;

    if (expires.get('day').value && expires.get('month').value && expires.get('year').value) {
      if (completed.get('day').value && completed.get('month').value && completed.get('year').value) {
        const completedDate = dayjs()
          .year(completed.get('year').value)
          .month(completed.get('month').value - 1)
          .date(completed.get('day').value);
        const expiresDate = dayjs()
          .year(expires.get('year').value)
          .month(expires.get('month').value - 1)
          .date(expires.get('day').value);

        if (completedDate.isValid() && expiresDate.isValid()) {
          return completedDate.isBefore(expiresDate) ? null : { expiresBeforeCompleted: true };
        }
      } else {
        return { completedRequired: true };
      }
    }
    return null;
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.trainingService.clearSelectedTrainingCategory();
    if (this.previousUrl?.length) {
      this.router.navigate(this.previousUrl);
    } else {
      this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
    }
  }

  protected navigateToDeleteTrainingRecord(): void {
    if (this.trainingCategory) {
      this.router.navigate([
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications-record',
        this.worker.uid,
        'training',
        this.trainingRecordId,
        { trainingCategory: JSON.stringify(this.trainingCategory) },
        'delete',
      ]);
    } else {
      this.router.navigate([
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications-record',
        this.worker.uid,
        'training',
        this.trainingRecordId,
        'delete',
      ]);
    }
  }

  public toggleNotesOpen(): void {
    this.notesOpen = !this.notesOpen;
  }
}
