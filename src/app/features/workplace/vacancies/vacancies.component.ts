import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { take } from 'rxjs/operators';

import { Question } from '../question/question.component';

enum vacancyOptions {
  NONE = 'None',
  // tslint:disable-next-line: quotemark
  DONT_KNOW = "Don't know",
}

@Component({
  selector: 'app-vacancies',
  templateUrl: './vacancies.component.html',
  styleUrls: ['./vacancies.component.scss'],
})
export class VacanciesComponent extends Question implements OnInit, OnDestroy {
  public total = 0;
  public jobs: Job[] = [];
  public vacanciesKnownOptions = [
    {
      label: 'There are no current staff vacancies.',
      value: vacancyOptions.NONE,
    },
    {
      label: `I don't know how many current staff vacancies there are.`,
      value: vacancyOptions.DONT_KNOW,
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
    protected jobService: JobService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      vacancies: this.formBuilder.array([]),
      vacanciesKnown: null,
    });
  }

  get vacanciesControl(): FormArray {
    return <FormArray>this.form.get('vacancies');
  }

  get allJobsSelected(): boolean {
    return this.vacanciesControl.controls.length >= this.jobs.length;
  }

  get totalVacancies(): number {
    return this.vacanciesControl.value.reduce((total, current) => (total += current.total ? current.total : 0), 0);
  }

  protected init(): void {
    this.subscriptions.add(
      this.jobService
        .getJobs()
        .pipe(take(1))
        .subscribe(jobs => (this.jobs = jobs))
    );
    this.prefill();

    this.previous = this.establishment.share.enabled
      ? ['/workplace', `${this.establishment.id}`, 'sharing-data-with-local-authorities']
      : ['/workplace', `${this.establishment.id}`, 'sharing-data'];

    this.subscriptions.add(
      this.form.get('vacanciesKnown').valueChanges.subscribe(value => {
        while (this.vacanciesControl.length > 1) {
          this.vacanciesControl.removeAt(1);
        }
        this.vacanciesControl.controls[0].get('jobRole').clearValidators();
        this.vacanciesControl.controls[0].get('total').clearValidators();
        this.vacanciesControl.reset([], { emitEvent: false });

        this.form.get('vacanciesKnown').setValue(value, { emitEvent: false });
      })
    );

    this.subscriptions.add(
      this.vacanciesControl.valueChanges.subscribe(() => {
        this.vacanciesControl.controls[0].get('jobRole').setValidators([Validators.required]);
        this.vacanciesControl.controls[0]
          .get('total')
          .setValidators([Validators.required, Validators.min(this.minVacancies), Validators.max(this.maxVacancies)]);

        this.form.get('vacanciesKnown').setValue(null, { emitEvent: false });
      })
    );
  }

  private prefill(): void {
    if (
      this.establishment.vacancies === vacancyOptions.NONE ||
      this.establishment.vacancies === vacancyOptions.DONT_KNOW
    ) {
      this.form.get('vacanciesKnown').setValue(this.establishment.vacancies);
    }
    {
      if (Array.isArray(this.establishment.vacancies) && this.establishment.vacancies.length) {
        this.establishment.vacancies.forEach(vacancy =>
          this.vacanciesControl.push(this.createVacancyControl(vacancy.jobId, vacancy.total))
        );
        this.form.get('vacanciesKnown').setValue(null);
      } else {
        this.vacanciesControl.push(this.createVacancyControl());
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
            message: 'Job Role is required',
          },
        ],
      },
      {
        item: 'vacancies.total',
        type: [
          {
            name: 'required',
            message: 'Total is required',
          },
          {
            name: 'min',
            message: 'Total must be 0 or above',
          },
          {
            name: 'max',
            message: 'Total must be 999 or lower',
          },
        ],
      },
    ];
  }

  public selectableJobs(index): Job[] {
    return this.jobs.filter(
      job =>
        !this.vacanciesControl.controls.some(
          vacancy =>
            vacancy !== this.vacanciesControl.controls[index] && parseInt(vacancy.get('jobRole').value, 10) === job.id
        )
    );
  }

  public addVacancy(): void {
    this.vacanciesControl.push(this.createVacancyControl());
  }

  public removeVacancy(event: Event, index): void {
    event.preventDefault();
    this.vacanciesControl.removeAt(index);
  }

  private createVacancyControl(jobId = null, total = null): FormGroup {
    return this.formBuilder.group({
      jobRole: [jobId, [Validators.required]],
      total: [total, [Validators.min(this.minVacancies), Validators.max(this.maxVacancies)]],
    });
  }

  protected generateUpdateProps() {
    const { vacanciesKnown } = this.form.controls;

    if (vacanciesKnown.value === vacancyOptions.NONE || vacanciesKnown.value === vacancyOptions.DONT_KNOW) {
      return { vacancies: vacanciesKnown.value };
    }

    if (this.vacanciesControl.controls.length) {
      return {
        vacancies: this.vacanciesControl.value.map(vacancy => ({
          jobId: parseInt(vacancy.jobRole, 10),
          total: vacancy.total,
        })),
      };
    }

    return null;
  }

  protected updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService
        .updateVacancies(this.establishment.id, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }

  protected onSuccess(): void {
    if (Array.isArray(this.establishment.vacancies) && this.establishment.vacancies) {
      this.next = ['/workplace', `${this.establishment.id}`, 'confirm-vacancies'];
    } else {
      this.next = ['/workplace', `${this.establishment.id}`, 'starters'];
    }
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
}
