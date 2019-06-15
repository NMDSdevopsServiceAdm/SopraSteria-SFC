import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';

import { Question } from '../question/question.component';

enum vacancyOptions {
  KNOWN = 'Known',
  NONE = 'None',
  // tslint:disable-next-line: quotemark
  DONTKNOW = "Don't know",
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
      label: 'I know how many current staff vacancies there are.',
      value: vacancyOptions.KNOWN,
      vacancies: true,
    },
    {
      label: 'There are no current staff vacancies.',
      value: vacancyOptions.NONE,
    },
    {
      label: `I don't know how many current staff vacancies there are.`,
      value: vacancyOptions.DONTKNOW,
    },
  ];

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
    this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobs = jobs)));
    this.prefill();

    this.previous = this.establishment.share.enabled
      ? ['/workplace', `${this.establishment.id}`, 'sharing-data-with-local-authorities']
      : ['/workplace', `${this.establishment.id}`, 'sharing-data'];

    this.subscriptions.add(
      this.form.get('vacanciesKnown').valueChanges.subscribe(value => {
        if (value !== vacancyOptions.KNOWN) {
        } else {
        }
        // while (vacancyControl.length > 1) {
        //   vacancyControl.removeAt(1);
        // }

        // vacancyControl.reset([], { emitEvent: false });
        // this.total = 0;
      })
    );
  }

  private prefill(): void {
    if (Array.isArray(this.establishment.vacancies) && this.establishment.vacancies.length) {
      this.establishment.vacancies.forEach(vacancy =>
        this.vacanciesControl.push(this.createVacancyControl(vacancy.jobId, vacancy.total))
      );
      this.form.get('vacanciesKnown').setValue(vacancyOptions.KNOWN);
    } else if (
      this.establishment.vacancies === vacancyOptions.NONE ||
      this.establishment.vacancies === vacancyOptions.DONTKNOW
    ) {
      this.form.get('vacanciesKnown').setValue(this.establishment.vacancies);
    } else {
      this.vacanciesControl.push(this.createVacancyControl());
    }
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [];
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
      jobRole: jobId,
      total: [total, [Validators.min(0), Validators.max(999)]],
    });
  }

  protected generateUpdateProps() {
    const { vacanciesKnown } = this.form.controls;

    if (this.vacanciesControl.controls.length) {
      return this.vacanciesControl.value.map(v => ({ jobId: parseInt(v.jobId, 10), total: v.total }));
    }

    if (vacanciesKnown.value === vacancyOptions.NONE || vacanciesKnown.value === vacancyOptions.DONTKNOW) {
      return { vacancies: vacanciesKnown.value };
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
}
