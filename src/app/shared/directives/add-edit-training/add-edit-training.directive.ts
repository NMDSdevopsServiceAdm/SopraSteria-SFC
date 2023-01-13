/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { MandatoryTraining, TrainingCategory, TrainingRecord, TrainingRecordRequest } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@shared/validators/date.validator';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Directive({})
export class AddEditTrainingDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted = false;
  public categories: TrainingCategory[];
  public trainingRecord: TrainingRecord;
  public trainingRecordId: string;
  public trainingCategory: string;
  public worker: Worker;
  public workplace: Establishment;
  public missingTrainingRecord: MandatoryTraining;
  public formErrorsMap: Array<ErrorDetails>;
  public notesMaxLength = 1000;
  private titleMaxLength = 120;
  private titleMinLength = 3;
  public subscriptions: Subscription = new Subscription();
  public previousUrl: string[];
  public title: string;
  public section: string;
  public buttonText: string;
  public showWorkerCount = false;
  public remainingCharacterCount: number = this.notesMaxLength;
  public notesValue = '';

  constructor(
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.missingTrainingRecord = history.state?.missingRecord;
    this.trainingCategory = localStorage.getItem('trainingCategory');
    this.previousUrl = [localStorage.getItem('previousUrl')];
    this.setupForm();
    this.init();
    this.setTitle();
    this.setSectionHeading();
    this.setButtonText();
    this.setBackLink();
    this.getCategories();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public handleOnInput(event: Event) {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }

  protected init(): void {}

  protected submit(record: any): void {}

  protected setTitle(): void {}

  protected setSectionHeading(): void {}

  protected setButtonText(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        title: [null, [Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
        category: this.missingTrainingRecord ? [null] : [null, Validators.required],
        accredited: null,
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
      this.trainingService.getCategories().subscribe(
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

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'category',
        type: [
          {
            name: 'required',
            message: 'Select the training category',
          },
        ],
      },
      {
        item: 'title',
        type: [
          {
            name: 'minlength',
            message: `Training name must be between ${this.titleMinLength} and ${this.titleMaxLength} characters`,
          },
          {
            name: 'maxlength',
            message: `Training name must be between ${this.titleMinLength} and ${this.titleMaxLength} characters`,
          },
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

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const { title, category, accredited, completed, expires, notes } = this.form.controls;
    const completedDate = this.dateGroupToDayjs(completed as FormGroup);
    const expiresDate = this.dateGroupToDayjs(expires as FormGroup);

    const record: TrainingRecordRequest = {
      trainingCategory: {
        id: !this.missingTrainingRecord ? parseInt(category.value) : this.missingTrainingRecord.id,
      },
      title: title.value,
      accredited: accredited.value,
      completed: completedDate ? completedDate.format(DATE_PARSE_FORMAT) : null,
      expires: expiresDate ? expiresDate.format(DATE_PARSE_FORMAT) : null,
      notes: notes.value,
    };

    this.submit(record);
  }

  dateGroupToDayjs(group: FormGroup): dayjs.Dayjs {
    const { day, month, year } = group.value;
    return day && month && year ? dayjs(`${year}-${month}-${day}`, DATE_PARSE_FORMAT) : null;
  }

  // TODO: Expiry Date validation cannot be before completed date
  expiresDateValidator(group: FormGroup): ValidationErrors {
    const completed = group.get('completed') as FormGroup;
    const expires = group.get('expires') as FormGroup;

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

  public onCancel(): void {
    this.router.navigate(this.previousUrl);
  }

  ngOnDestroy(): void {
    localStorage.removeItem('trainingCategory');
    localStorage.removeItem('previousUrl');
  }
}
