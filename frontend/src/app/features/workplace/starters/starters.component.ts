import { Component } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Question } from '@features/workplace/question/question.component';

@Component({
  selector: 'app-starters',
  templateUrl: './starters.component.html',
})
export class StartersComponent extends Question {
  public section = 'Vacancies and turnover';
  public total = 0;
  public jobs: Job[] = [];
  public startersKnownOptions = [
    {
      label: 'There have been no new starters in the last 12 months',
      value: jobOptionsEnum.NONE,
    },
    {
      label: 'I do not know how many new starters there have been',
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];
  public emptyForm = true;
  private minStarters = 1;
  private maxStarters = 999;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  get starterRecords(): UntypedFormArray {
    return this.form.get('starterRecords') as UntypedFormArray;
  }

  get noRecordsReason(): AbstractControl {
    return this.form.get('noRecordsReason') as UntypedFormControl;
  }

  get allJobsSelected(): boolean {
    return this.starterRecords.length >= this.jobs.length;
  }

  get totalStarters(): number {
    return this.starterRecords.value.reduce((total, current) => (total += current.total ? current.total : 0), 0);
  }

  protected init(): void {
    this.jobs = this.route.snapshot.data.jobs;
    this.setupForm();
    this.setPreviousRoute();
    this.prefill();

    this.subscriptions.add(
      this.form.get('noRecordsReason').valueChanges.subscribe((value) => {
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
        this.starterRecords.controls[0].get('jobRole').setValidators([Validators.required]);
        this.starterRecords.controls[0]
          .get('total')
          .setValidators([Validators.required, Validators.min(this.minStarters), Validators.max(this.maxStarters)]);

        this.starterRecords.controls[0].get('jobRole').updateValueAndValidity({ emitEvent: false });
        this.starterRecords.controls[0].get('total').updateValueAndValidity({ emitEvent: false });
        this.form.get('noRecordsReason').setValue(null, { emitEvent: false });

        if (this.emptyForm && this.starterRecords.controls[0].get('jobRole').value) {
          this.submitted = false;
        }

        this.addErrorLinkFunctionality();
      }),
    );

    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'leavers'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      starterRecords: this.formBuilder.array([]),
      noRecordsReason: null,
    });
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'vacancies'];
  }

  private prefill(): void {
    if (Array.isArray(this.establishment.starters) && this.establishment.starters.length) {
      this.establishment.starters.forEach((starter) =>
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
    this.formErrorsMap = [];

    this.starterRecords.controls.forEach((_, index) => {
      this.formErrorsMap.push(
        {
          item: `starterRecords.jobRole.${index}`,
          type: [
            {
              name: 'required',
              message:
                index === 0 ? 'Select the job role and enter the number of starters, or tell us there are none' : '',
            },
          ],
        },
        {
          item: `starterRecords.total.${index}`,
          type: [
            { name: 'required', message: '' },
            { name: 'min', message: '' },
            { name: 'max', message: '' },
          ],
        },
      );
    });
  }

  private newFormErrorsMap(): void {
    this.formErrorsMap = [];

    this.starterRecords.controls.forEach((_, index) => {
      this.formErrorsMap.push(
        {
          item: `starterRecords.jobRole.${index}`,
          type: [
            {
              name: 'required',
              message: `Select the job role (job role ${index + 1})`,
            },
          ],
        },
        {
          item: `starterRecords.total.${index}`,
          type: [
            {
              name: 'required',
              message: `Enter the number of new starters (job role ${index + 1})`,
            },
            {
              name: 'min',
              message: `Number must be between ${this.minStarters} and ${this.maxStarters} (job role ${index + 1})`,
            },
            {
              name: 'max',
              message: `Number must be between ${this.minStarters} and ${this.maxStarters} (job role ${index + 1})`,
            },
          ],
        },
      );
    });
  }

  public selectableJobs(index): Job[] {
    return this.jobs.filter(
      (job) =>
        !this.starterRecords.controls.some(
          (starter) =>
            starter !== this.starterRecords.controls[index] && parseInt(starter.get('jobRole').value, 10) === job.id,
        ),
    );
  }

  /**
   * Add new starter record
   * And reset no records reason and clear validators
   * As the radio's shouldn't be selected
   */
  public addStarter(): void {
    this.submitted = false;
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
    this.submitted = false;
  }

  private createRecordItem(jobRole: number = null, total: number = null): UntypedFormGroup {
    return this.formBuilder.group({
      jobRole: [jobRole, [Validators.required]],
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
        starters: this.starterRecords.value.map((starterRecord) => ({
          jobId: parseInt(starterRecord.jobRole, 10),
          total: starterRecord.total,
        })),
      };
    }

    return null;
  }

  protected updateEstablishment(props: UpdateJobsRequest): void {
    this.subscriptions.add(
      this.establishmentService.updateJobs(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'leavers'];
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private clearValidators(index: number) {
    this.starterRecords.controls[index].get('jobRole').clearValidators();
    this.starterRecords.controls[index].get('total').clearValidators();
  }

  protected createDynamicErrorMessaging(): void {
    if (this.starterRecords.controls[0].get('jobRole').valid || this.starterRecords.controls[0].get('total').valid) {
      this.emptyForm = false;
      this.newFormErrorsMap();
    } else {
      this.emptyForm = true;
      this.setupFormErrorsMap();
    }
  }

  protected addErrorLinkFunctionality(): void {
    if (!this.errorSummaryService.formEl$.value) {
      this.errorSummaryService.formEl$.next(this.formEl);
    }
  }
}
