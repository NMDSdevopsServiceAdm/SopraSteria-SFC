import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NoRecordsReason, PostStartersRequest, Starter } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { Question } from '@features/workplace/question/question.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Component({
  selector: 'app-starters',
  templateUrl: './starters.component.html',
})
export class StartersComponent extends Question {
  public jobs: Job[] = [];
  public noRecordsReasonEnum = NoRecordsReason;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private jobService: JobService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init() {
    this.setupForm();
    this.setPreviousRoute();
    this.getJobs();
    this.getStarters();
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'noRecordsReason',
        type: [
          {
            name: 'required',
            message: `Please specify if there's been any new starters.`,
          },
        ],
      },
      {
        item: 'starterRecords',
        type: [
          {
            name: 'invalid',
            message: 'Please select a job and enter number of new starters.',
          },
        ],
      },
    ];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      starterRecords: this.formBuilder.array([]),
      noRecordsReason: '',
    });
  }

  private setPreviousRoute(): void {
    this.previous = ['/workplace', `${this.establishment.id}`, 'vacancies'];
  }

  get starterRecords(): FormArray {
    return <FormArray>this.form.controls.starterRecords;
  }

  get noRecordsReason(): AbstractControl {
    return <FormControl>this.form.controls.noRecordsReason;
  }

  private getJobs(): void {
    this.subscriptions.add(this.jobService.getJobs().subscribe((jobs: Job[]) => (this.jobs = jobs)));
  }

  private getStarters(): void {
    this.subscriptions.add(
      this.establishmentService.getStarters().subscribe((starters: string | Starter[]) => {
        this.preSelectNoRecordsReason(starters);
        this.prePopulateStarterRecords(starters);
      })
    );
  }

  private preSelectNoRecordsReason(starters: string | Starter[]): void {
    if (typeof starters === 'string') {
      const patchValue: string =
        starters === this.noRecordsReasonEnum.NONE ? this.noRecordsReasonEnum.NONE : this.noRecordsReasonEnum.DONT_KNOW;
      this.noRecordsReason.patchValue(patchValue);
    }
  }

  private prePopulateStarterRecords(starters: string | Starter[]): void {
    if (Array.isArray(starters) && starters.length) {
      starters.forEach((starter: Starter) =>
        this.starterRecords.push(this.createRecordItem(starter.jobId, starter.total))
      );
    }
  }

  public calculateTotal(): number {
    return this.starterRecords.value.reduce((acc, i) => (acc += parseInt(i.total, 10) || 0), 0) || 0;
  }

  /**
   * Add new starter record
   * And reset no records reason and clear validators
   * As the radio's shouldn't be selected
   */
  public addStarter(): void {
    this.starterRecords.push(this.createRecordItem());
    this.noRecordsReason.reset();
    this.noRecordsReason.clearValidators();
    this.noRecordsReason.updateValueAndValidity();
  }

  private createRecordItem(jobId: number = null, total: number = null): FormGroup {
    return this.formBuilder.group(
      {
        jobId: [jobId],
        total: [total],
      },
      { validator: CustomValidators.bothControlsHaveValues }
    );
  }

  public submitHandler(): void {
    if (this.starterRecords.invalid) {
      this.starterRecords.setErrors({ invalid: true });
    }

    this.onSubmit();
  }

  private getStartersRequest(): PostStartersRequest {
    const request: PostStartersRequest = { starters: null };

    if (this.noRecordsReason.value) {
      request.starters = this.noRecordsReason.value;
    } else {
      request.starters = this.starterRecords.value.map(starterRecord => ({
        jobId: parseInt(starterRecord.jobId, 10),
        total: starterRecord.total,
      }));
    }

    return request;
  }

  private setNextRoute(): void {
    const route: string = this.noRecordsReason.value ? 'leavers' : 'confirm-starters';
    this.next = ['/workplace', `${this.establishment.id}`, route];
  }

  protected generateUpdateProps(): void {
    this.setNextRoute();

    this.subscriptions.add(
      this.establishmentService.postStarters(this.getStartersRequest()).subscribe()
    );
  }

  /**
   * Filter original jobs list
   * And return jobs that haven't been already selected
   * @param index
   */
  public filteredJobs(index: number): Job[] {
    const thisRecord = this.starterRecords.controls[index];
    return this.jobs.filter(
      (job: Job) => !this.starterRecords.controls.some(v => v !== thisRecord && parseFloat(v.value.jobId) === job.id)
    );
  }

  /**
   * Method responsible for checking
   * To see if there are any more jobs left
   * That haven't been selected yet
   * Controls visibility of the Add starter CTA button
   */
  public allJobsTaken(): boolean {
    return this.jobs.length === this.starterRecords.length;
  }

  /**
   * Remove starter record
   * And if all starter records have been removed
   * Then set required validator on radios
   * @param index
   */
  public removeRecord(index: number): void {
    this.starterRecords.removeAt(index);

    if (!this.starterRecords.length) {
      this.noRecordsReason.setValidators([Validators.required]);
      this.noRecordsReason.updateValueAndValidity();
    }
  }
}
