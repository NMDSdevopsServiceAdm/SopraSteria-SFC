import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Job } from '../../core/model/job.model';
import { EstablishmentService } from '../../core/services/establishment.service';
import { JobService } from '../../core/services/job.service';
import { MessageService } from '../../core/services/message.service';

@Component({
  selector: 'app-starters',
  templateUrl: './starters.component.html',
  styleUrls: ['./starters.component.scss'],
})
export class StartersComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public total = 0;
  public jobsAvailable: Job[] = [];
  public noRecordsReasons = [
    {
      label: 'There have been no new starters.',
      value: 'no-new',
    },
    {
      label: `I don't know how many new starters there have been.`,
      value: 'dont-know',
    },
  ];
  private subscriptions = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private jobService: JobService,
    private establishmentService: EstablishmentService,
    private messageService: MessageService
  ) {
    this.validatorRecordTotal = this.validatorRecordTotal.bind(this);
    this.validatorRecordJobId = this.validatorRecordJobId.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      recordsControl: this.formBuilder.array([]),
      noRecordsReason: '',
    });

    const recordsControl = <FormArray>this.form.controls.recordsControl;

    this.subscriptions.push(this.jobService.getJobs().subscribe(jobs => (this.jobsAvailable = jobs)));

    this.subscriptions.push(
      this.establishmentService.getStarters().subscribe(starters => {
        if (starters === 'None') {
          // Even if "None" option on restore, want a single job role shown
          recordsControl.push(this.createRecordItem());

          this.form.patchValue({ noRecordsReason: 'no-new' }, { emitEvent: true });
        } else if (starters === `Don't know`) {
          // Even if "Don't know" option on restore, want a single job role shown
          recordsControl.push(this.createRecordItem());

          this.form.patchValue({ noRecordsReason: 'dont-know' }, { emitEvent: true });
        } else if (Array.isArray(starters) && starters.length) {
          starters.forEach(v => recordsControl.push(this.createRecordItem(v.jobId.toString(), v.total)));
        } else {
          // If no options and no starters (the value has never been set) - just the default (select job) drop down
          recordsControl.push(this.createRecordItem());
        }
      })
    );

    this.total = this.calculateTotal(recordsControl.value);

    this.subscriptions.push(
      recordsControl.valueChanges.subscribe(value => {
        this.total = this.calculateTotal(value);

        if (document.activeElement && document.activeElement.getAttribute('type') !== 'radio') {
          this.form.patchValue({ noRecordsReason: '' }, { emitEvent: false });
        }
      })
    );

    this.subscriptions.push(
      this.form.controls.noRecordsReason.valueChanges.subscribe(value => {
        while (recordsControl.length > 1) {
          recordsControl.removeAt(1);
        }

        recordsControl.reset([], { emitEvent: false });
        this.total = 0;
      })
    );

    this.subscriptions.push(
      this.form.valueChanges.subscribe(() => {
        this.messageService.clearAll();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  createRecordItem(jobId = null, total = null): FormGroup {
    return this.formBuilder.group({
      jobId: [jobId, this.validatorRecordJobId],
      total: [total, [Validators.min(0), Validators.max(999), this.validatorRecordTotal]],
    });
  }

  submitHandler(): void {
    const { recordsControl, noRecordsReason } = this.form.controls;

    if (this.form.valid || noRecordsReason.value === 'no-new' || noRecordsReason.value === 'dont-know') {
      // regardless of which option is chosen, must always submit to backend
      let startersToSubmit = null;
      let nextStepNavigation = null;

      if (noRecordsReason.value === 'dont-know') {
        startersToSubmit = `Don't know`;
        nextStepNavigation = '/leavers';
      } else if (noRecordsReason.value === 'no-new') {
        startersToSubmit = 'None';
        nextStepNavigation = '/leavers';
      } else {
        // default being to send the set of all the current jobs which then need to be confirmed.
        startersToSubmit = recordsControl.value.map(v => ({ jobId: parseInt(v.jobId, 10), total: v.total }));
        nextStepNavigation = '/confirm-starters';
      }

      this.subscriptions.push(
        this.establishmentService.postStarters(startersToSubmit).subscribe(() => {
          this.router.navigate([nextStepNavigation]);
        })
      );
    } else {
      this.messageService.clearError();
      this.messageService.show('error', 'Please fill the required fields.');
    }
  }

  jobsLeft(idx) {
    const recordsControl = <FormArray>this.form.controls.recordsControl;
    const thisRecord = recordsControl.controls[idx];
    return this.jobsAvailable.filter(
      j => !recordsControl.controls.some(v => v !== thisRecord && parseFloat(v.value.jobId) === j.id)
    );
  }

  addVacancy(): void {
    const recordsControl = <FormArray>this.form.controls.recordsControl;

    recordsControl.push(this.createRecordItem());
  }

  isJobsNotTakenLeft() {
    return this.jobsAvailable.length !== this.form.controls.recordsControl.value.length;
  }

  removeRecord(index): void {
    (<FormArray>this.form.controls.recordsControl).removeAt(index);
  }

  validatorRecordTotal(control) {
    return control.value !== null || this.form.controls.noRecordsReason.value.length ? {} : { total: true };
  }

  validatorRecordJobId(control) {
    return control.value !== null || this.form.controls.noRecordsReason.value.length ? {} : { jobId: true };
  }

  calculateTotal(records) {
    return records.reduce((acc, i) => (acc += parseInt(i.total, 10) || 0), 0) || 0;
  }
}
