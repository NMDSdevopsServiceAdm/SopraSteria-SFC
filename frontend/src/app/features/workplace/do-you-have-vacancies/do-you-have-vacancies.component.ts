import { Component, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';

@Component({
  selector: 'app-do-you-have-vacancies',
  templateUrl: './do-you-have-vacancies.component.html',
})
export class DoYouHaveVacanciesComponent extends Question implements OnInit {
  public section = 'Vacancies and turnover';
  public hasVacancies: boolean = false;
  public vacanciesKnownOptions = [
    {
      label: 'Yes',
      value: jobOptionsEnum.YES,
    },
    {
      label: 'No',
      value: jobOptionsEnum.NONE,
    },
    {
      label: 'I do not know',
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  public init(): void {
    this.hasVacancies = localStorage.getItem('hasVacancies') === 'true' ? true : false;
    this.setupForm();
    this.previousRoute = ['/workplace', this.establishment.uid, 'service-users'];
    this.prefill();
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'starters'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      vacanciesKnown: null,
    });
  }

  private prefill(): void {
    if (
      (typeof this.establishment.vacancies === 'object' && this.establishment.vacancies?.length > 0) ||
      this.hasVacancies
    ) {
      this.form.setValue({
        vacanciesKnown: jobOptionsEnum.YES,
      });
    } else if (
      this.establishment.vacancies === jobOptionsEnum.NONE ||
      this.establishment.vacancies === jobOptionsEnum.DONT_KNOW
    ) {
      this.form.setValue({
        vacanciesKnown: this.establishment.vacancies,
      });
    }
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const { vacanciesKnown } = this.form.controls;

    if (vacanciesKnown.value === jobOptionsEnum.NONE || vacanciesKnown.value === jobOptionsEnum.DONT_KNOW) {
      localStorage.setItem('hasVacancies', 'false');
      this.hasVacancies = false;

      return { vacancies: vacanciesKnown.value };
    } else if (vacanciesKnown.value === jobOptionsEnum.YES) {
      this.hasVacancies = true;
      localStorage.setItem('hasVacancies', 'true');
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
    if (this.hasVacancies) {
      this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'select-vacancy-job-roles'];
    } else if (!this.hasVacancies && this.return) {
      this.submitAction = { action: 'return', save: true };
    } else {
      this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'starters'];
    }
  }
}
