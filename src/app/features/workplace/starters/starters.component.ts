import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { Question } from '@features/workplace/question/question.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-starters',
  templateUrl: './starters.component.html',
})
export class StartersComponent extends Question {
  public total = 0;
  public jobs: Job[] = [];
  public startersKnownOptions = [
    {
      label: 'There have been no new starters.',
      value: jobOptionsEnum.NONE,
    },
    {
      label: `I don't know how many new starters there have been.`,
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];
  private minStarters = 0;
  private maxStarters = 999;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private jobService: JobService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.setupForm();
  }

  get starterRecords(): FormArray {
    return this.form.get('starterRecords') as FormArray;
  }

  get noRecordsReason(): AbstractControl {
    return this.form.get('noRecordsReason') as FormControl;
  }

  get allJobsSelected(): boolean {
    return this.starterRecords.length >= this.jobs.length;
  }

  get totalStarters(): number {
    return this.starterRecords.value.reduce((total, current) => (total += current.total ? current.total : 0), 0);
  }

  protected init() {
    this.getJobs();
    this.setPreviousRoute();
    this.prefill();

    this.subscriptions.add(
      this.form.get('noRecordsReason').valueChanges.subscribe(value => {
        while (this.starterRecords.length > 1) {
          this.starterRecords.removeAt(1);
        }

        this.clearValidators(0);
        this.starterRecords.reset([], { emitEvent: false });

        this.form.get('noRecordsReason').setValue(value, { emitEvent: false });
      }),
    );

    this.subscriptions.add(
      this.starterRecords.valueChanges.subscribe(() => {
        this.starterRecords.controls[0].get('jobId').setValidators([Validators.required]);
        this.starterRecords.controls[0]
          .get('total')
          .setValidators([Validators.required, Validators.min(this.minStarters), Validators.max(this.maxStarters)]);

        this.form.get('noRecordsReason').setValue(null, { emitEvent: false });
      }),
    );
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      starterRecords: this.formBuilder.array([]),
      noRecordsReason: null,
    });
  }

  private setPreviousRoute(): void {
    this.previous = ['/workplace', `${this.establishment.uid}`, 'vacancies'];
  }

  private getJobs(): void {
    this.subscriptions.add(
      this.jobService
        .getJobs()
        .pipe(take(1))
        .subscribe(jobs => (this.jobs = jobs)),
    );
  }

  private prefill(): void {
    if (Array.isArray(this.establishment.starters) && this.establishment.starters.length) {
      this.establishment.starters.forEach(starter =>
        this.starterRecords.push(this.createRecordItem(starter.jobId, starter.total)),
      );
    } else {
      this.starterRecords.push(this.createRecordItem());
      if (
        this.establishment.starters === jobOptionsEnum.NONE ||
        this.establishment.starters === jobOptionsEnum.DONT_KNOW
      ) {
        this.form.get('noRecordsReason').setValue(this.establishment.starters);
        this.clearValidators(0);
      }
    }
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'starterRecords.jobId',
        type: [
          {
            name: 'required',
            message: 'Job role is required.',
          },
        ],
      },
      {
        item: 'starterRecords.total',
        type: [
          {
            name: 'required',
            message: 'Enter number of new starters.',
          },
          {
            name: 'min',
            message: `New starters must be ${this.minStarters} or above.`,
          },
          {
            name: 'max',
            message: `New starters must be ${this.maxStarters} or lower.`,
          },
        ],
      },
    ];
  }

  public selectableJobs(index): Job[] {
    return this.jobs.filter(
      job =>
        !this.starterRecords.controls.some(
          starter =>
            starter !== this.starterRecords.controls[index] && parseInt(starter.get('jobId').value, 10) === job.id,
        ),
    );
  }

  /**
   * Add new starter record
   * And reset no records reason and clear validators
   * As the radio's shouldn't be selected
   */
  public addStarter(): void {
    this.starterRecords.push(this.createRecordItem());
  }

  /**
   * Remove starter record
   * And if all starter records have been removed
   * Then set required validator on radios
   * @param index
   */
  public removeRecord(event: Event, index: number): void {
    event.preventDefault();
    this.starterRecords.removeAt(index);
  }

  private createRecordItem(jobId: number = null, total: number = null): FormGroup {
    return this.formBuilder.group({
      jobId: [jobId, [Validators.required]],
      total: [total, [Validators.required, Validators.min(this.minStarters), Validators.max(this.maxStarters)]],
    });
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const { noRecordsReason } = this.form.value;

    if (noRecordsReason === jobOptionsEnum.NONE || noRecordsReason === jobOptionsEnum.DONT_KNOW) {
      return { starters: noRecordsReason };
    }

    if (this.starterRecords.length) {
      return {
        starters: this.starterRecords.value.map(starterRecord => ({
          jobId: parseInt(starterRecord.jobId, 10),
          total: starterRecord.total,
        })),
      };
    }

    return null;
  }

  protected updateEstablishment(props: UpdateJobsRequest): void {
    this.subscriptions.add(
      this.establishmentService.updateJobs(this.establishment.uid, props).subscribe(
        data => this._onSuccess(data),
        error => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    if (this.establishment.starters && Array.isArray(this.establishment.starters)) {
      this.router.navigate(['/workplace', this.establishment.uid, 'confirm-starters']);
      this.submitAction.action = null;
    } else {
      this.next = ['/workplace', `${this.establishment.uid}`, 'leavers'];
    }
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private clearValidators(index: number) {
    this.starterRecords.controls[index].get('jobId').clearValidators();
    this.starterRecords.controls[index].get('total').clearValidators();
  }
}
