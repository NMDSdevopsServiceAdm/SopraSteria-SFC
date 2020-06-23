import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataSharingOptions } from '@core/model/data-sharing.model';
import { jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { take } from 'rxjs/operators';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-vacancies',
  templateUrl: './vacancies.component.html',
})
export class VacanciesComponent extends Question implements OnInit, OnDestroy {
  public total = 0;
  public jobs: Job[] = [];
  public vacanciesKnownOptions = [
    {
      label: 'There are no current staff vacancies.',
      value: jobOptionsEnum.NONE,
    },
    {
      label: `I don't know how many current staff vacancies there are.`,
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];
  private minVacancies = 0;
  private maxVacancies = 999;

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

  get vacanciesArray(): FormArray {
    return this.form.get('vacancies') as FormArray;
  }

  get allJobsSelected(): boolean {
    return this.vacanciesArray.length >= this.jobs.length;
  }

  get totalVacancies(): number {
    return this.vacanciesArray.value.reduce((total, current) => (total += current.total ? current.total : 0), 0);
  }

  protected init(): void {
    this.getJobs();
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'total-staff'];
    this.prefill();

    this.subscriptions.add(
      this.form.get('vacanciesKnown').valueChanges.subscribe(value => {
        while (this.vacanciesArray.length > 1) {
          this.vacanciesArray.removeAt(1);
        }

        this.clearValidators(0);
        this.vacanciesArray.reset([], { emitEvent: false });

        this.form.get('vacanciesKnown').setValue(value, { emitEvent: false });
      }),
    );

    this.subscriptions.add(
      this.vacanciesArray.valueChanges.subscribe(() => {
        this.vacanciesArray.controls[0].get('jobRole').setValidators([Validators.required]);
        this.vacanciesArray.controls[0]
          .get('total')
          .setValidators([Validators.required, Validators.min(this.minVacancies), Validators.max(this.maxVacancies)]);

        this.form.get('vacanciesKnown').setValue(null, { emitEvent: false });
      }),
    );
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      vacancies: this.formBuilder.array([]),
      vacanciesKnown: null,
    });
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
    if (Array.isArray(this.establishment.vacancies) && this.establishment.vacancies.length) {
      this.establishment.vacancies.forEach(vacancy =>
        this.vacanciesArray.push(this.createVacancyControl(vacancy.jobId, vacancy.total)),
      );
    } else {
      this.vacanciesArray.push(this.createVacancyControl());
      if (
        this.establishment.vacancies === jobOptionsEnum.NONE ||
        this.establishment.vacancies === jobOptionsEnum.DONT_KNOW
      ) {
        this.form.get('vacanciesKnown').setValue(this.establishment.vacancies);
        this.clearValidators(0);
      }
    }
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'vacancies.jobRole',
        type: [
          {
            name: 'required',
            message: 'Job role is required.',
          },
        ],
      },
      {
        item: 'vacancies.total',
        type: [
          {
            name: 'required',
            message: 'Enter number of vacancies.',
          },
          {
            name: 'min',
            message: `Vacancies must be ${this.minVacancies} or above`,
          },
          {
            name: 'max',
            message: `Vacancies must be ${this.maxVacancies} or lower`,
          },
        ],
      },
    ];
  }

  public selectableJobs(index): Job[] {
    return this.jobs.filter(
      job =>
        !this.vacanciesArray.controls.some(
          vacancy =>
            vacancy !== this.vacanciesArray.controls[index] && parseInt(vacancy.get('jobRole').value, 10) === job.id,
        ),
    );
  }

  public addVacancy(): void {
    this.vacanciesArray.push(this.createVacancyControl());
  }

  public removeVacancy(event: Event, index): void {
    event.preventDefault();
    this.vacanciesArray.removeAt(index);
  }

  private createVacancyControl(jobId = null, total = null): FormGroup {
    return this.formBuilder.group({
      jobRole: [jobId, [Validators.required]],
      total: [total, [Validators.required, Validators.min(this.minVacancies), Validators.max(this.maxVacancies)]],
    });
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const { vacanciesKnown } = this.form.controls;

    if (vacanciesKnown.value === jobOptionsEnum.NONE || vacanciesKnown.value === jobOptionsEnum.DONT_KNOW) {
      return { vacancies: vacanciesKnown.value };
    }

    if (this.vacanciesArray.length) {
      return {
        vacancies: this.vacanciesArray.value.map(vacancy => ({
          jobId: parseInt(vacancy.jobRole, 10),
          total: vacancy.total,
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
    if (this.establishment.vacancies && Array.isArray(this.establishment.vacancies) && !this.return) {
      this.router.navigate(['/workplace', this.establishment.uid, 'confirm-vacancies']);
      this.submitAction.action = null;
    } else {
      this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'starters'];
    }
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private clearValidators(index: number) {
    this.vacanciesArray.controls[index].get('jobRole').clearValidators();
    this.vacanciesArray.controls[index].get('total').clearValidators();
  }
}
