import { Component, OnInit } from '@angular/core';
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
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-training',
  templateUrl: './add-edit-training.component.html',
})
export class AddEditTrainingComponent implements OnInit {
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
  private subscriptions: Subscription = new Subscription();
  public previousUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private trainingService: TrainingService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.worker = this.workerService.worker;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    this.workerService.getRoute$.subscribe(route => {
      if (route) {
        this.previousUrl = route;
      }
    });
    const parsed = this.router.parseUrl(this.previousUrl);
    this.backService.setBackLink({
      url: [parsed.root.children.primary.segments.map(seg => seg.path).join('/')],
      fragment: parsed.fragment,
      queryParams: parsed.queryParams
    });

    this.form = this.formBuilder.group({
      title: [
        null,
        [Validators.maxLength(this.titleMaxLength)],
      ],
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
    });

    const minDate = moment().subtract(100, 'years');

    this.form
      .get('completed')
      .setValidators([DateValidator.dateValid(), DateValidator.todayOrBefore(), DateValidator.min(minDate)]);
    this.form.get('expires').setValidators([DateValidator.dateValid(), DateValidator.min(minDate)]);

    this.subscriptions.add(
      this.trainingService.getCategories().subscribe(
        categories => {
          if (categories) {
            this.categories = categories;
          }
        },
        error => {
          console.error(error.error);
        }
      )
    );

    if (this.trainingRecordId) {
      this.subscriptions.add(
        this.workerService.getTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId).subscribe(
          trainingRecord => {
            if (trainingRecord) {
              this.trainingRecord = trainingRecord;

              const completed = this.trainingRecord.completed
                ? moment(this.trainingRecord.completed, DATE_PARSE_FORMAT)
                : null;
              const expires = this.trainingRecord.expires
                ? moment(this.trainingRecord.expires, DATE_PARSE_FORMAT)
                : null;

              this.form.patchValue({
                title: this.trainingRecord.title,
                category: this.trainingRecord.trainingCategory.id,
                accredited: this.trainingRecord.accredited,
                ...(completed && {
                  completed: {
                    day: completed.date(),
                    month: completed.format('M'),
                    year: completed.year(),
                  },
                }),
                ...(expires && {
                  expires: {
                    day: expires.date(),
                    month: expires.format('M'),
                    year: expires.year(),
                  },
                }),
                notes: this.trainingRecord.notes,
              });
            }
          },
          error => {
            console.error(error.error);
          }
        )
      );
    }

    this.setupFormErrorsMap();
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
            name: 'maxlength',
            message: `Training name must be between ${this.titleMinLength} and ${this.titleMaxLength} characters in length`,
          },
        ],
      },
      {
        item: 'accredited',
        type: [
          {
            name: 'required',
            message: 'Select if training is accredited',
          },
        ],
      },
      {
        item: 'completed',
        type: [
          {
            name: 'required',
            message: 'Completed date is required.',
          },
          {
            name: 'dateValid',
            message: 'Completed date must be a valid date.',
          },
          {
            name: 'todayOrBefore',
            message: 'Completed date must be before today.',
          },
          {
            name: 'dateMin',
            message: 'Completed date cannot be more than 100 years ago.',
          },
        ],
      },
      {
        item: 'expires',
        type: [
          {
            name: 'dateValid',
            message: 'Expiry date must be a valid date.',
          },
          {
            name: 'dateMin',
            message: 'Expiry date cannot be more than 100 years ago.',
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
            message: `Notes must be ${this.notesMaxLength} characters or less`,
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
    const completedDate = this.dateGroupToMoment(completed as FormGroup);
    const expiresDate = this.dateGroupToMoment(expires as FormGroup);

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

    if (this.trainingRecordId) {
      this.subscriptions.add(
        this.workerService
          .updateTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId, record)
          .subscribe(
            () => this.onSuccess(),
            error => this.onError(error)
          )
      );
    } else {
      this.subscriptions.add(
        this.workerService.createTrainingRecord(this.workplace.uid, this.worker.uid, record).subscribe(
          () => this.onSuccess(),
          error => this.onError(error)
        )
      );
    }
  }

  private onSuccess() {
    let url = '';
    if (this.previousUrl.indexOf('dashboard') > -1) {
      url = this.previousUrl;
    } else {
      url = `/workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}/training`;
    }
    this.router
      .navigateByUrl(url)
      .then(() => {
        if (this.trainingRecordId) {
          this.workerService.alert = { type: 'success', message: 'Training has been saved.' };
        } else {
          this.workerService.alert = { type: 'success', message: 'Training has been added.' };
        }
      });
  }

  private onError(error) {
    console.log(error);
  }

  dateGroupToMoment(group: FormGroup): moment.Moment {
    const { day, month, year } = group.value;
    return day && month && year ? moment(`${year}-${month}-${day}`, DATE_PARSE_FORMAT) : null;
  }

  // TODO: Expiry Date validation cannot be before completed date
  expiresDateValidator(group: FormGroup): ValidationErrors {
    const completed = group.get('completed') as FormGroup;
    const expires = group.get('expires') as FormGroup;

    if (expires.get('day').value && expires.get('month').value && expires.get('year').value) {
      if (completed.get('day').value && completed.get('month').value && completed.get('year').value) {
        const completedDate = moment()
          .year(completed.get('year').value)
          .month(completed.get('month').value - 1)
          .date(completed.get('day').value);
        const expiresDate = moment()
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
  public navigateToPreviousPage() {
    this.router.navigateByUrl(this.previousUrl);
  }
}
