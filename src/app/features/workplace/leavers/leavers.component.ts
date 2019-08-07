import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { take } from 'rxjs/operators';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-leavers',
  templateUrl: './leavers.component.html',
})
export class LeaversComponent extends Question implements OnInit, OnDestroy {
  public total = 0;
  public jobs: Job[] = [];
  public leaversKnownOptions = [
    {
      label: 'There have been no new leavers.',
      value: jobOptionsEnum.NONE,
    },
    {
      label: `I don't know how many new leavers there have been.`,
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];
  private minTotal = 0;
  private maxTotal = 999;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private jobService: JobService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.setupForm();
  }

  get leavers(): FormArray {
    return <FormArray>this.form.get('leavers');
  }

  get allJobsSelected(): boolean {
    return this.leavers.length >= this.jobs.length;
  }

  get totalLeavers(): number {
    return this.leavers.value.reduce((total, current) => (total += current.total ? current.total : 0), 0);
  }

  protected init(): void {
    this.getJobs();
    this.setPreviousRoute();
    this.prefill();

    this.subscriptions.add(
      this.form.get('leaversKnown').valueChanges.subscribe(value => {
        while (this.leavers.length > 1) {
          this.leavers.removeAt(1);
        }

        this.clearValidators(0);
        this.leavers.reset([], { emitEvent: false });

        this.form.get('leaversKnown').setValue(value, { emitEvent: false });
      })
    );

    this.subscriptions.add(
      this.leavers.valueChanges.subscribe(() => {
        this.leavers.controls[0].get('jobRole').setValidators([Validators.required]);
        this.leavers.controls[0]
          .get('total')
          .setValidators([Validators.required, Validators.min(this.minTotal), Validators.max(this.maxTotal)]);

        this.form.get('leaversKnown').setValue(null, { emitEvent: false });
      })
    );
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      leavers: this.formBuilder.array([]),
      leaversKnown: null,
    });
  }

  private setPreviousRoute(): void {
    this.previous = ['/workplace', `${this.establishment.uid}`, 'starters'];
  }

  private getJobs(): void {
    this.subscriptions.add(
      this.jobService
        .getJobs()
        .pipe(take(1))
        .subscribe(jobs => (this.jobs = jobs))
    );
  }

  private prefill(): void {
    if (Array.isArray(this.establishment.leavers) && this.establishment.leavers.length) {
      this.establishment.leavers.forEach(leaver =>
        this.leavers.push(this.createLeaverControl(leaver.jobId, leaver.total))
      );
    } else {
      this.leavers.push(this.createLeaverControl());
      if (
        this.establishment.leavers === jobOptionsEnum.NONE ||
        this.establishment.leavers === jobOptionsEnum.DONT_KNOW
      ) {
        this.form.get('leaversKnown').setValue(this.establishment.leavers);
        this.clearValidators(0);
      }
    }
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'leavers.jobRole',
        type: [
          {
            name: 'required',
            message: 'Job Role is required',
          },
        ],
      },
      {
        item: 'leavers.total',
        type: [
          {
            name: 'required',
            message: 'Total is required',
          },
          {
            name: 'min',
            message: `Total must be ${this.minTotal} or above`,
          },
          {
            name: 'max',
            message: `Total must be ${this.maxTotal} or lower`,
          },
        ],
      },
    ];
  }

  public selectableJobs(index): Job[] {
    return this.jobs.filter(
      job =>
        !this.leavers.controls.some(
          leaver => leaver !== this.leavers.controls[index] && parseInt(leaver.get('jobRole').value, 10) === job.id
        )
    );
  }

  public addLeaver(): void {
    this.leavers.push(this.createLeaverControl());
  }

  public removeLeaver(event: Event, index): void {
    event.preventDefault();
    this.leavers.removeAt(index);
  }

  private createLeaverControl(jobId = null, total = null): FormGroup {
    return this.formBuilder.group({
      jobRole: [jobId, [Validators.required]],
      total: [total, [Validators.required, Validators.min(this.minTotal), Validators.max(this.maxTotal)]],
    });
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const { leaversKnown } = this.form.value;

    if (leaversKnown === jobOptionsEnum.NONE || leaversKnown === jobOptionsEnum.DONT_KNOW) {
      return { leavers: leaversKnown };
    }

    if (this.leavers.length) {
      return {
        leavers: this.leavers.value.map(leaver => ({
          jobId: parseInt(leaver.jobRole, 10),
          total: leaver.total,
        })),
      };
    }

    return null;
  }

  protected updateEstablishment(props: UpdateJobsRequest): void {
    this.subscriptions.add(
      this.establishmentService
        .updateJobs(this.establishment.uid, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }

  protected onSuccess(): void {
    if (this.establishment.leavers && Array.isArray(this.establishment.leavers)) {
      this.router.navigate(['/workplace', this.establishment.uid, 'confirm-leavers']);
      this.submitAction.action = null;
    } else {
      this.next = ['/workplace', `${this.establishment.uid}`, 'check-answers'];
    }
  }

  private clearValidators(index: number) {
    this.leavers.controls[index].get('jobRole').clearValidators();
    this.leavers.controls[index].get('total').clearValidators();
  }
}
