import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCategory, TrainingRecord, TrainingRecordRequest } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@shared/validators/date.validator';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Directive({})
export class AddEditTrainingDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted = false;
  public categories: TrainingCategory[];
  public trainingRecord: TrainingRecord;
  public trainingRecordId: string;
  public worker: Worker;
  public workplace: Establishment;
  public formErrorsMap: Array<ErrorDetails>;
  public notesMaxLength = 1000;
  private titleMaxLength = 120;
  private titleMinLength = 3;
  public subscriptions: Subscription = new Subscription();
  public previousUrl: string[];
  public title: string;
  public buttonText: string;
  public showWorkerCount = false;
  public newTrainingAndQualificationsRecordsFlag: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.workplace = this.route.parent.snapshot.data.establishment;

    this.init();
    this.setupForm();
    this.setTitle();
    this.setButtonText();
    await this.setFeatureFlag();
    this.setBackLink();
    this.getCategories();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setBackLink(): void {}

  protected init(): void {}

  protected submit(record: any): void {}

  protected setTitle(): void {}

  protected setButtonText(): void {}

  protected async setFeatureFlag(): Promise<void> {}

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        title: [null, [Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
        category: [null, Validators.required],
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
    this.form.get('expires').setValidators([DateValidator.dateValid(), DateValidator.min(minDate)]);
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
            message: 'Select a training category',
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
            name: 'expiresBeforeCompleted',
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
        id: parseInt(category.value, 10),
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

  public onCancel(): void {
    this.router.navigateByUrl(this.previousUrl[0]);
  }
}
