import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Starter } from '@core/model/establishment.model';
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
    this.getJobs();
    this.getStarters();

    // TODO dont think this is needed
    // this.subscriptions.push(
    //   this.starterRecords.valueChanges.subscribe(value => {
    //     this.total = this.calculateTotal(value);
    //
    //     if (document.activeElement && document.activeElement.getAttribute('type') !== 'radio') {
    //       this.form.patchValue(
    //         {
    //           noRecordsReason: '',
    //         },
    //         { emitEvent: false }
    //       );
    //     }
    //   })
    // );

    // TODO double check to see if needed
    // this.subscriptions.add(
    //   this.noRecordsReason.valueChanges.subscribe(() => {
    //     while (starterRecords.length > 1) {
    //       starterRecords.removeAt(1);
    //     }
    //
    //     starterRecords.reset([], { emitEvent: false });
    //     this.total = 0;
    //   })
    // );
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      starterRecords: this.formBuilder.array([]),
      noRecordsReason: '',
    });
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
      this.establishmentService.getStarters().subscribe((starters: Starter[]) => {
        console.log(starters, typeof starters);
        if (typeof starters === 'string') {
          if (starters === 'None') {
            // Even if "None" option on restore, want a single job role shown
            this.starterRecords.push(this.createRecordItem());
            this.noRecordsReason.patchValue('no-new');
          } else if (starters === `Don't know`) {
            // Even if "Don't know" option on restore, want a single job role shown
            this.starterRecords.push(this.createRecordItem());
            this.noRecordsReason.patchValue('dont-know');
          }
        } else if (Array.isArray(starters) && starters.length) {
          starters.forEach((starter: Starter) =>
            this.starterRecords.push(this.createRecordItem(starter.jobId, starter.total))
          );
        } else {
          // If no options and no starters (the value has never been set) - just the default (select job) drop down
          this.starterRecords.push(this.createRecordItem());
        }
      })
    );
  }

  public calculateTotal(): number {
    return this.starterRecords.value.reduce((acc, i) => (acc += parseInt(i.total, 10) || 0), 0) || 0;
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

  public addStarter(): void {
    this.starterRecords.push(this.createRecordItem());
  }

  // TODO replaced with bothControlsHaveValues
  private validatorRecordTotal(control: AbstractControl): { [key: string]: boolean } | null {
    console.log('validatorRecordTotal', control.value);
    return control.value !== null || this.noRecordsReason.value.length ? null : { total: true };
  }

  // TODO replaced with bothControlsHaveValues
  private validatorRecordJobId(control: AbstractControl): { [key: string]: boolean } | null {
    console.log('validatorRecordJobId', control.value);
    return control.value !== null || this.noRecordsReason.value.length ? null : { jobId: true };
  }

  // TODO move to template
  // noRecordsReasons = [
  //   {
  //     label: 'There have been no new starters.',
  //     value: 'no-new',
  //   },
  //   {
  //     label: `I don't know how many new starters there have been.`,
  //     value: 'dont-know',
  //   },
  // ];

  public onSubmit(): void {
    const { starterRecords, noRecordsReason } = this.form.controls;

    if (this.form.valid || noRecordsReason.value === 'no-new' || noRecordsReason.value === 'dont-know') {
      // regardless of which option is chosen, must always submit to backend
      let startersToSubmit = null;
      let nextStepNavigation = null;

      if (noRecordsReason.value === 'dont-know') {
        startersToSubmit = `Don't know`;
        nextStepNavigation = '/workplace/leavers';
      } else if (noRecordsReason.value === 'no-new') {
        startersToSubmit = 'None';
        nextStepNavigation = '/workplace/leavers';
      } else {
        // default being to send the set of all the current jobs which then need to be confirmed.
        startersToSubmit = starterRecords.value.map(v => ({ jobId: parseInt(v.jobId, 10), total: v.total }));
        nextStepNavigation = '/workplace/confirm-starters';
      }

      this.subscriptions.add(
        this.establishmentService.postStarters(startersToSubmit).subscribe(() => {
          this.router.navigate([nextStepNavigation]);
        })
      );
    } else {
      // this.messageService.clearError();
      // this.messageService.show('error', 'Please fill the required fields.');
    }
  }

  jobsLeft(idx) {
    const starterRecords = <FormArray>this.form.controls.starterRecords;
    const thisRecord = starterRecords.controls[idx];
    return this.jobs.filter(
      j => !starterRecords.controls.some(v => v !== thisRecord && parseFloat(v.value.jobId) === j.id)
    );
  }

  isJobsNotTakenLeft() {
    return this.jobs.length !== this.starterRecords.value.length;
  }

  removeRecord(index): void {
    this.starterRecords.removeAt(index);
  }
}
