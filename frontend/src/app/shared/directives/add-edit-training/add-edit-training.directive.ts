/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Category, Establishment } from '@core/model/establishment.model';
import { TrainingCategory, TrainingRecord, TrainingRecordRequest } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@shared/validators/date.validator';
import dayjs from 'dayjs';
import { forEach } from 'lodash';
import { Subscription } from 'rxjs';

@Directive({})
export class AddEditTrainingDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public categories: TrainingCategory[];
  public trainingRecord: TrainingRecord;
  // TODO: Add a defined type to this
  public groupNames: string[];
  public trainingGroups: any;
  public selectedTrainingCategoryId: number;
  public trainingRecordId: string;
  public trainingCategory: { id: number; category: string };
  public worker: Worker;
  public workplace: Establishment;
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

  trainingCategoriesControl = new FormControl();

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
    if (this.route.snapshot.queryParamMap.get('trainingCategory')) {
      this.trainingCategory = JSON.parse(this.route.snapshot.queryParamMap.get('trainingCategory'));
    }
    this.previousUrl = [localStorage.getItem('previousUrl')];
    this.setupForm();
    this.init();
    this.prefill();
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

  protected prefill(): void {}

  protected submit(record: any): void {}

  protected setTitle(): void {}

  protected setSectionHeading(): void {}

  protected setButtonText(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        category: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  private getCategories(): void {
    this.subscriptions.add(
      this.trainingService.getCategories().subscribe(
        (categories) => {
          if (categories) {
            this.categories = categories;
            // Get an array of the training groups
            let groupMap = new Map(
              categories.filter(x => x.trainingCategoryGroup !== null).map((x) => {
                return [JSON.stringify(x.trainingCategoryGroup), x.trainingCategoryGroup];
              })
            );
            this.groupNames = Array.from(groupMap.values());
            // create a new object from the groups array and populate each group with the appropriate training categories
            this.trainingGroups = {};
            for(const group of this.groupNames) {
              const tempArray = [];
              categories.map(x => { if(x.trainingCategoryGroup === group) {
                tempArray.push({
                  text: x.category,
                  id: x.id,
                  seq: x.seq,
                })
              };
              this.trainingGroups[group] = tempArray;
              });
            }
          }
          console.log(this.trainingGroups);
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
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    console.log(this.form.controls.category.value);
    // this.submitted = true;
    // this.errorSummaryService.syncFormErrorsEvent.next(true);

    // if (!this.form.valid) {
    //   this.errorSummaryService.scrollToErrorSummary();
    //   return;
    // }

    // const { title, category, accredited, completed, expires, notes } = this.form.controls;
    // const completedDate = this.dateGroupToDayjs(completed as UntypedFormGroup);
    // const expiresDate = this.dateGroupToDayjs(expires as UntypedFormGroup);

    // const record: TrainingRecordRequest = {
    //   trainingCategory: {
    //     id: parseInt(category.value),
    //   },
    //   title: title.value,
    //   accredited: accredited.value,
    //   completed: completedDate ? completedDate.format(DATE_PARSE_FORMAT) : null,
    //   expires: expiresDate ? expiresDate.format(DATE_PARSE_FORMAT) : null,
    //   notes: notes.value,
    // };

    // this.submit(record);
  }

  dateGroupToDayjs(group: UntypedFormGroup): dayjs.Dayjs {
    const { day, month, year } = group.value;
    return day && month && year ? dayjs(`${year}-${month}-${day}`, DATE_PARSE_FORMAT) : null;
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
}
