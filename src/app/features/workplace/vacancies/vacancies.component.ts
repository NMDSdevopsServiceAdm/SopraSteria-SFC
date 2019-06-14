import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-vacancies',
  templateUrl: './vacancies.component.html',
  styleUrls: ['./vacancies.component.scss'],
})
export class VacanciesComponent extends Question implements OnInit, OnDestroy {
  public total = 0;
  public jobs: Job[] = [];
  public noVacanciesReasonOptions = [
    {
      label: 'There are no current staff vacancies.',
      value: 'no-staff',
    },
    {
      label: `I don't know how many current staff vacancies there are.`,
      value: 'dont-know',
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

    this.form = this.formBuilder.group({});

    // this.validatorRecordTotal = this.validatorRecordTotal.bind(this);
    // this.validatorRecordJobId = this.validatorRecordJobId.bind(this);
  }

  protected init(): void {
    this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobs = jobs)));
    // PREFILL FORM

    this.next = ['/workplace', `${this.establishment.id}`, 'confirm-vacancies'];
    this.previous = this.establishment.share.enabled
      ? ['/workplace', `${this.establishment.id}`, 'sharing-data-with-local-authorities']
      : ['/workplace', `${this.establishment.id}`, 'sharing-data'];
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [];
  }

  protected generateUpdateProps() {
    return null;
  }

  updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService
        .updateVacancies(this.establishment.id, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }

  // submitHandler(): void {
  //   const { vacancyControl, noVacanciesReason } = this.vacanciesForm.controls;

  //   if (this.vacanciesForm.valid || noVacanciesReason.value === 'no-staff' || noVacanciesReason.value === 'dont-know') {
  //     // regardless of which option is chosen, must always submit to backend
  //     let vacanciesToSubmit = null;
  //     let nextStepNavigation = null;

  //     if (noVacanciesReason.value === 'dont-know') {
  //       vacanciesToSubmit = `Don't know`;
  //       nextStepNavigation = '/workplace/starters';
  //     } else if (noVacanciesReason.value === 'no-staff') {
  //       vacanciesToSubmit = 'None';
  //       nextStepNavigation = '/workplace/starters';
  //     } else {
  //       // default being to send the set of all the current jobs which then need to be confirmed.
  //       vacanciesToSubmit = vacancyControl.value.map(v => ({ jobId: parseInt(v.jobId), total: v.total }));
  //       nextStepNavigation = '/workplace/confirm-vacancies';
  //     }
  //   }
  // }

  // jobsLeft(idx) {
  //   const vacancyControl = <FormArray>this.vacanciesForm.controls.vacancyControl;
  //   const thisVacancy = vacancyControl.controls[idx];
  //   return this.jobsAvailable.filter(
  //     j => !vacancyControl.controls.some(v => v !== thisVacancy && parseFloat(v.value.jobId) === j.id)
  //   );
  // }

  // addVacancy(): void {
  //   const vacancyControl = <FormArray>this.vacanciesForm.controls.vacancyControl;

  //   vacancyControl.push(this.createVacancyControlItem());
  // }

  // isJobsNotTakenLeft() {
  //   return this.jobsAvailable.length !== this.vacanciesForm.controls.vacancyControl.value.length;
  // }

  // removeVacancy(index): void {
  //   (<FormArray>this.vacanciesForm.controls.vacancyControl).removeAt(index);
  // }

  // validatorRecordTotal(control) {
  //   return control.value !== null || this.vacanciesForm.controls.noVacanciesReason.value.length ? {} : { total: true };
  // }

  // validatorRecordJobId(control) {
  //   return control.value !== null || this.vacanciesForm.controls.noVacanciesReason.value.length ? {} : { jobId: true };
  // }

  // createVacancyControlItem(jobId = null, total = null): FormGroup {
  //   return this.fb.group({
  //     jobId: [jobId, this.validatorRecordJobId],
  //     total: [total, this.validatorRecordTotal],
  //   });
  // }

  // calculateTotal(vacancies) {
  //   return vacancies.reduce((acc, i) => (acc += parseInt(i.total, 10) || 0), 0) || 0;
  // }

  // ngOnInit() {
  //   this.subscriptions.push(this.jobService.getJobs().subscribe(jobs => (this.jobsAvailable = jobs)));

  //   this.vacanciesForm = this.fb.group({
  //     vacancyControl: this.fb.array([]),
  //     noVacanciesReason: '',
  //   });

  //   const vacancyControl = <FormArray>this.vacanciesForm.controls.vacancyControl;

  //   this.subscriptions.push(
  //     this.establishmentService.getVacancies().subscribe(vacancies => {
  //       if (vacancies === 'None') {
  //         // Even if "None" option on restore, want a single job role shown
  //         // to force another deployment
  //         vacancyControl.push(this.createVacancyControlItem());

  //         this.vacanciesForm.patchValue({ noVacanciesReason: 'no-staff' }, { emitEvent: true });
  //       } else if (vacancies === `Don't know`) {
  //         // Even if "Don't know" option on restore, want a single job role shown
  //         vacancyControl.push(this.createVacancyControlItem());

  //         this.vacanciesForm.patchValue({ noVacanciesReason: 'dont-know' }, { emitEvent: true });
  //       } else if (Array.isArray(vacancies) && vacancies.length) {
  //         vacancies.forEach(v => vacancyControl.push(this.createVacancyControlItem(v.jobId.toString(), v.total)));
  //       } else {
  //         // If no options and no vacancies (the value has never been set) - just the default (select job) drop down
  //         vacancyControl.push(this.createVacancyControlItem());
  //       }
  //     })
  //   );

  //   this.total = this.calculateTotal(vacancyControl.value);

  //   this.subscriptions.push(
  //     vacancyControl.valueChanges.subscribe(value => {
  //       this.total = this.calculateTotal(value);

  //       if (document.activeElement && document.activeElement.getAttribute('type') !== 'radio') {
  //         this.vacanciesForm.patchValue(
  //           {
  //             noVacanciesReason: '',
  //           },
  //           { emitEvent: false }
  //         );
  //       }
  //     })
  //   );

  //   this.subscriptions.push(
  //     this.vacanciesForm.controls.noVacanciesReason.valueChanges.subscribe(() => {
  //       while (vacancyControl.length > 1) {
  //         vacancyControl.removeAt(1);
  //       }

  //       vacancyControl.reset([], { emitEvent: false });
  //       this.total = 0;
  //     })
  //   );

  //   this.subscriptions.push(
  //     this.vacanciesForm.valueChanges.subscribe(() => {
  //       this.messageService.clearAll();
  //     })
  //   );
  // }
}
