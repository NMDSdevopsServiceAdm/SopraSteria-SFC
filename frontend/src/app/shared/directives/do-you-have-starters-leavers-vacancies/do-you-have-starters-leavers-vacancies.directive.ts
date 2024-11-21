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
  public dataToPrefill: any;
  public hasStartersLeaversOrVacancies: boolean;
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
    this.setPageVariables();
    this.prefillForm();
    this.setupRoutes();
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      startersLeaversVacanciesKnown: null,
    });
  }

  protected setupRoutes(): void {}

  protected setPageVariables(): void {}

  protected getFromLocalStorage(): void {
    this.hasStartersLeaversOrVacancies = localStorage.getItem(this.localStorageKey) === 'true' ? true : false;
  }

  protected setToLocalStorage(): void {}

  protected getDataToPrefill(): void {}

  protected prefillForm(): void {
    this.getDataToPrefill();
    this.getFromLocalStorage();
    if (
      (typeof this.dataToPrefill === 'object' && this.dataToPrefill?.length > 0) ||
      this.hasStartersLeaversOrVacancies
    ) {
      this.form.setValue({
        startersLeaversVacanciesKnown: jobOptionsEnum.YES,
      });
    } else if (this.dataToPrefill === jobOptionsEnum.NONE || this.dataToPrefill === jobOptionsEnum.DONT_KNOW) {
      this.form.setValue({
        startersLeaversVacanciesKnown: this.dataToPrefill,
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
      this.hasStartersLeaversOrVacancies = false;

      return { [this.valueToUpdate]: startersLeaversVacanciesKnown.value };
    } else if (startersLeaversVacanciesKnown.value === jobOptionsEnum.YES) {
      this.hasStartersLeaversOrVacancies = true;
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
    if (this.hasStartersLeaversOrVacancies) {
      this.nextRoute = ['/workplace', `${this.establishment.uid}`, this.startersLeaversOrVacanciesPageTwo];
    } else if (!this.hasStartersLeaversOrVacancies && this.return) {
      this.submitAction = { action: 'return', save: true };
    } else {
      this.nextRoute = this.skipRoute;
    }
  }
}
