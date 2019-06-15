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
    if (this.form.valid) {
      let startersToSubmit = null;

      if (this.noRecordsReason.value === 'dont-know') {
        startersToSubmit = `Don't know`;
      } else if (this.noRecordsReason.value === 'no-new') {
        startersToSubmit = 'None';
      } else {
        // default being to send the set of all the current jobs which then need to be confirmed.
        startersToSubmit = this.starterRecords.value.map(v => ({ jobId: parseInt(v.jobId, 10), total: v.total }));
      }

      this.subscriptions.add(
        this.establishmentService.postStarters(startersToSubmit).subscribe(() => {
          const nextRoute: string = this.noRecordsReason.value ? '/workplace/leavers' : '/workplace/confirm-starters';
          this.router.navigate([nextRoute]);
        })
      );
    } else {
      // this.messageService.clearError();
      // this.messageService.show('error', 'Please fill the required fields.');
    }
  }

  public jobsLeft(index: number): Job[] {
    const thisRecord = this.starterRecords.controls[index];
    return this.jobs.filter(
      (job: Job) => !this.starterRecords.controls.some(v => v !== thisRecord && parseFloat(v.value.jobId) === job.id)
    );
  }

  public isJobsNotTakenLeft(): boolean {
    return this.jobs.length !== this.starterRecords.value.length;
  }

  public removeRecord(index: number): void {
    this.starterRecords.removeAt(index);
  }
}
