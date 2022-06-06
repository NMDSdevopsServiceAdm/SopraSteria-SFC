import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

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
      label: 'There have been no leavers in the last 12 months',
      value: jobOptionsEnum.NONE,
    },
    {
      label: `I do not know how many leavers there have been`,
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];
  public emptyForm = true;
  private minTotal = 1;
  private maxTotal = 999;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  get leavers(): FormArray {
    return this.form.get('leavers') as FormArray;
  }

  get allJobsSelected(): boolean {
    return this.leavers.length >= this.jobs.length;
  }

  get totalLeavers(): number {
    return this.leavers.value.reduce((total, current) => (total += current.total ? current.total : 0), 0);
  }

  protected init(): void {
    this.jobs = this.route.snapshot.data.jobs;
    this.setupForm();
    this.setPreviousRoute();
    this.prefill();

    this.subscriptions.add(
      this.form.get('leaversKnown').valueChanges.subscribe((value) => {
        while (this.leavers.length > 1) {
          this.leavers.removeAt(1);
        }

        this.clearValidators(0);
        this.leavers.reset([], { emitEvent: false });

        this.form.get('leaversKnown').setValue(value, { emitEvent: false });
      }),
    );

    this.subscriptions.add(
      this.leavers.valueChanges.subscribe(() => {
        this.leavers.controls[0].get('jobRole').setValidators([Validators.required]);
        this.leavers.controls[0]
          .get('total')
          .setValidators([Validators.required, Validators.min(this.minTotal), Validators.max(this.maxTotal)]);

        this.leavers.controls[0].get('jobRole').updateValueAndValidity({ emitEvent: false });
        this.leavers.controls[0].get('total').updateValueAndValidity({ emitEvent: false });
        this.form.get('leaversKnown').setValue(null, { emitEvent: false });
      }),
    );
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      leavers: this.formBuilder.array([]),
      leaversKnown: null,
    });
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'starters'];
  }

  private prefill(): void {
    if (Array.isArray(this.establishment.leavers) && this.establishment.leavers.length) {
      this.establishment.leavers.forEach((leaver) =>
        this.leavers.push(this.createLeaverControl(leaver.jobId, leaver.total)),
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
    this.formErrorsMap = [];

    this.leavers.controls.forEach((control, index) => {
      this.formErrorsMap.push(
        {
          item: `leavers.jobRole.${index}`,
          type: [
            {
              name: 'required',
              message:
                index === 0 ? 'Select the job role and enter the number of leavers, or tell us there are none' : '',
            },
          ],
        },
        {
          item: `leavers.total.${index}`,
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

    this.leavers.controls.forEach((control, index) => {
      this.formErrorsMap.push(
        {
          item: `leavers.jobRole.${index}`,
          type: [
            {
              name: 'required',
              message: `Select the job role (job role ${index + 1})`,
            },
          ],
        },
        {
          item: `leavers.total.${index}`,
          type: [
            {
              name: 'required',
              message: `Enter the number of leavers (job role ${index + 1})`,
            },
            {
              name: 'min',
              message: `Number must be between ${this.minTotal} - ${this.maxTotal} (job role ${index + 1})`,
            },
            {
              name: 'max',
              message: `Number must be between ${this.minTotal} - ${this.maxTotal} (job role ${index + 1})`,
            },
          ],
        },
      );
    });
  }

  public selectableJobs(index): Job[] {
    return this.jobs.filter(
      (job) =>
        !this.leavers.controls.some(
          (leaver) => leaver !== this.leavers.controls[index] && parseInt(leaver.get('jobRole').value, 10) === job.id,
        ),
    );
  }

  public addLeaver(): void {
    this.submitted = false;
    this.leavers.push(this.createLeaverControl());
  }

  public removeLeaver(event: Event, index): void {
    event.preventDefault();
    this.leavers.removeAt(index);
    this.submitted = false;
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
        leavers: this.leavers.value.map((leaver) => ({
          jobId: parseInt(leaver.jobRole, 10),
          total: leaver.total,
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
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'check-answers'];
  }

  private clearValidators(index: number) {
    this.leavers.controls[index].get('jobRole').clearValidators();
    this.leavers.controls[index].get('total').clearValidators();
  }

  protected createDynamicErrorMessaging(): void {
    if (this.leavers.controls[0].get('jobRole').valid || this.leavers.controls[0].get('total').valid) {
      this.emptyForm = false;
      this.newFormErrorsMap();
    } else {
      this.emptyForm = true;
      this.setupFormErrorsMap();
    }
  }
}
