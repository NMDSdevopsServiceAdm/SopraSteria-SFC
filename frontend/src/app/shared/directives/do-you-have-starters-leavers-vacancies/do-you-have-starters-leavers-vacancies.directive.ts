import { Directive, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { DateUtil } from '@core/utils/date-util';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { Question } from '@features/workplace/question/question.component';

@Directive({})
export class DoYouHaveStartersLeaversVacanciesDirective extends Question implements OnDestroy {
  public section = WorkplaceFlowSections.VACANCIES_AND_TURNOVER;
  public heading: string;
  public hintText: string;
  public revealText: string;
  public hasSelectedYesWithoutSavingJobRoles: boolean;
  protected hasStartersLeaversVacanciesField: string;
  protected numbersField: string;
  public startersLeaversOrVacanciesPageTwo: string;
  public valueToUpdate: string;
  public requiredWarningMessage: string;
  public todayOneYearAgo: string;
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

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      startersLeaversVacanciesKnown: [null, { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'startersLeaversVacanciesKnown',
        type: [
          {
            name: 'required',
            message: this.requiredWarningMessage,
          },
        ],
      },
    ];
  }

  protected getFromLocalStorage(): boolean {
    return localStorage.getItem(this.hasStartersLeaversVacanciesField) === 'true' ? true : false;
  }

  protected prefillForm(): void {
    this.hasSelectedYesWithoutSavingJobRoles = this.getFromLocalStorage();
    const currentValueOfField = this.establishment?.[this.valueToUpdate];

    if (this.hasSelectedYesWithoutSavingJobRoles || Array.isArray(currentValueOfField)) {
      this.form.setValue({
        startersLeaversVacanciesKnown: jobOptionsEnum.YES,
      });
    } else if (!!currentValueOfField) {
      this.form.setValue({
        startersLeaversVacanciesKnown: currentValueOfField,
      });
    }
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const { startersLeaversVacanciesKnown } = this.form.controls;

    if (
      startersLeaversVacanciesKnown.value === jobOptionsEnum.NONE ||
      startersLeaversVacanciesKnown.value === jobOptionsEnum.DONT_KNOW
    ) {
      localStorage.setItem(this.hasStartersLeaversVacanciesField, 'false');
      this.hasSelectedYesWithoutSavingJobRoles = false;

      return { [this.valueToUpdate]: startersLeaversVacanciesKnown.value };
    } else if (startersLeaversVacanciesKnown.value === jobOptionsEnum.YES) {
      this.hasSelectedYesWithoutSavingJobRoles = true;
      localStorage.setItem(this.hasStartersLeaversVacanciesField, 'true');
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

  protected getPreviousRoute(field: string): Array<string> {
    if (Array.isArray(this.establishment[field]) && this.establishment[field].length > 0) {
      return ['/workplace', this.establishment?.uid, `how-many-${field}`];
    } else {
      return ['/workplace', this.establishment?.uid, `do-you-have-${field}`];
    }
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

  protected clearLocalStorageData(): void {
    localStorage.removeItem(this.hasStartersLeaversVacanciesField);
    localStorage.removeItem(this.numbersField);
  }

  protected getDateForOneYearAgo(): string {
    return DateUtil.getDateForOneYearAgo();
  }

  ngOnDestroy(): void {
    if (!this.submitted) {
      this.clearLocalStorageData();
    }
  }
}
