import { Directive, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Question } from '@features/workplace/question/question.component';

@Directive({})
export class DoYouHaveStartersLeaversVacanciesDirective extends Question implements OnInit {
  public section = 'Vacancies and turnover';
  public heading: string;
  public hintText: string;
  public revealText: string;
  public dataFromEstablishment: any;
  public hasSelectedYesWithoutSavingJobRoles: boolean;
  public localStorageKey: string;
  public startersLeaversOrVacanciesPageTwo: string;
  public valueToUpdate: string;
  public knownOptions = [
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
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  public init(): void {
    this.setupForm();
    this.prefillForm();
    this.setupRoutes();
  }

  protected setupRoutes(): void {}
  protected getDataFromEstablishment(): any {}

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      startersLeaversVacanciesKnown: null,
    });
  }

  protected getFromLocalStorage(): boolean {
    return localStorage.getItem(this.localStorageKey) === 'true' ? true : false;
  }

  protected prefillForm(): void {
    this.dataFromEstablishment = this.getDataFromEstablishment();
    this.hasSelectedYesWithoutSavingJobRoles = this.getFromLocalStorage();
    if (
      (typeof this.dataFromEstablishment === 'object' && this.dataFromEstablishment?.length > 0) ||
      this.hasSelectedYesWithoutSavingJobRoles
    ) {
      this.form.setValue({
        startersLeaversVacanciesKnown: jobOptionsEnum.YES,
      });
    } else if (
      this.dataFromEstablishment === jobOptionsEnum.NONE ||
      this.dataFromEstablishment === jobOptionsEnum.DONT_KNOW
    ) {
      this.form.setValue({
        startersLeaversVacanciesKnown: this.dataFromEstablishment,
      });
    }
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const { startersLeaversVacanciesKnown } = this.form.controls;

    if (
      startersLeaversVacanciesKnown.value === jobOptionsEnum.NONE ||
      startersLeaversVacanciesKnown.value === jobOptionsEnum.DONT_KNOW
    ) {
      localStorage.setItem(this.localStorageKey, 'false');
      this.hasSelectedYesWithoutSavingJobRoles = false;

      return { [this.valueToUpdate]: startersLeaversVacanciesKnown.value };
    } else if (startersLeaversVacanciesKnown.value === jobOptionsEnum.YES) {
      this.hasSelectedYesWithoutSavingJobRoles = true;
      localStorage.setItem(this.localStorageKey, 'true');
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
    if (this.hasSelectedYesWithoutSavingJobRoles) {
      this.nextRoute = ['/workplace', `${this.establishment.uid}`, this.startersLeaversOrVacanciesPageTwo];
    } else if (!this.hasSelectedYesWithoutSavingJobRoles && this.return) {
      this.submitAction = { action: 'return', save: true };
    } else {
      this.nextRoute = this.skipRoute;
    }
  }
}
