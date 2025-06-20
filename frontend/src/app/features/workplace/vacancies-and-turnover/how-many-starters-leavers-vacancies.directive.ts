import { Directive, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Leaver, Starter, StarterLeaverVacancy, UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FormatUtil } from '@core/utils/format-util';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { JobRoleNumbersTableComponent } from '@shared/components/job-role-numbers-table/job-role-numbers-table.component';

import { VacanciesAndTurnoverService } from '../../../core/services/vacancies-and-turnover.service';
import { Question } from '../question/question.component';

@Directive()
export class HowManyStartersLeaversVacanciesDirective extends Question implements OnInit, OnDestroy {
  @ViewChild('jobRoleNumbersTable') jobRoleNumbersTable: JobRoleNumbersTableComponent;
  public heading: string;
  public instruction: string;
  public revealTextContent: string;
  public jobRoleType: string;
  public fieldName: string;
  public fieldJobRoles: string;
  public section: string = WorkplaceFlowSections.VACANCIES_AND_TURNOVER;
  public jobRolesTableTitle: string;
  public totalNumberDescription: string;

  protected selectedJobRoles: Array<Starter | Leaver | Vacancy> = [];
  protected jobRoleErrorMessages: Record<number, string> = {};

  private minNumberPerJobRole = 1;
  private maxNumberPerJobRole = 999;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected vacanciesAndTurnoverService: VacanciesAndTurnoverService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.loadSelectedJobRoles();
    this.setPreviousRoute();
    this.setupForm();
  }

  protected clearLocalStorageData(): void {}

  protected returnToFirstPage(): void {}

  protected returnToJobRoleSelectionPage(): void {}

  protected setPreviousRoute(): void {}

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      jobRoleNumbers: this.formBuilder.array([]),
    });

    this.selectedJobRoles.forEach((jobRole) => {
      const initialValue = jobRole.total ?? '';
      this.jobRoleNumbers.push(
        this.formBuilder.control(initialValue, {
          validators: [
            Validators.required,
            Validators.min(this.minNumberPerJobRole),
            Validators.max(this.maxNumberPerJobRole),
            Validators.pattern('^[0-9]+$'),
          ],
          updateOn: 'submit',
        }),
      );
    });
  }

  get jobRoleNumbers(): UntypedFormArray {
    return this.form.get('jobRoleNumbers') as UntypedFormArray;
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    throw new Error('To be implemented at component');
  }

  protected updateEstablishment(props: UpdateJobsRequest): void {
    this.subscriptions.add(
      this.establishmentService.updateJobs(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {}

  protected navigate(): Promise<boolean> {
    const action = this.submitAction.action;

    if (['continue', 'exit', 'return'].includes(action)) {
      this.clearLocalStorageData();
    }

    return super.navigate();
  }

  public setBackLink(): void {
    this.back = { url: this.previousRoute };
    this.backService.setBackLink(this.back);
  }

  protected getErrorMessage(errorType: string, jobRoleTitle?: string): string {
    const jobRoleTitleSuffix = jobRoleTitle ? ` (${jobRoleTitle})` : '';
    switch (errorType) {
      case 'required':
        return `Enter the number of ${this.jobRoleType}${jobRoleTitleSuffix}`;

      case 'min':
      case 'max':
      case 'pattern':
        return `Number of ${this.jobRoleType} must be between ${this.minNumberPerJobRole} and ${this.maxNumberPerJobRole}${jobRoleTitleSuffix}`;
    }
  }

  public loadSelectedJobRoles(): void {
    try {
      this.selectedJobRoles = this.getSelectedJobRoleFromService();
      if (!this.selectedJobRoles) {
        this.selectedJobRoles = this.establishment[this.fieldName];
      }
    } catch (err) {
      this.returnToFirstPage();
    }
    if (!Array.isArray(this.selectedJobRoles) || this.selectedJobRoles?.length === 0) {
      this.returnToFirstPage();
    }

    this.selectedJobRoles = this.replaceNullWithOne(this.selectedJobRoles);
  }

  protected getSelectedJobRoleFromService(): Array<StarterLeaverVacancy> {
    throw new Error('To be implemented at component');
  }

  protected replaceNullWithOne(selectedJobRoles: Array<StarterLeaverVacancy>): Array<StarterLeaverVacancy> {
    return selectedJobRoles.map((job) => {
      const updatedNumber = job.total ?? 1;
      return { ...job, total: updatedNumber };
    });
  }

  protected saveSelectedJobRolesToService(): void {}

  protected handleAddJobRole(): void {
    this.saveSelectedJobRolesToService();
    this.returnToJobRoleSelectionPage();
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [];

    this.jobRoleNumbers.controls.forEach((_, index) => {
      const jobRoleTitleInLowerCase = FormatUtil.formatToLowercaseExcludingAcronyms(this.selectedJobRoles[index].title);
      this.formErrorsMap.push({
        item: `jobRoleNumbers.${index}`,
        type: [
          {
            name: 'required',
            message: this.getErrorMessage('required', jobRoleTitleInLowerCase),
          },
          {
            name: 'min',
            message: this.getErrorMessage('min', jobRoleTitleInLowerCase),
          },
          {
            name: 'max',
            message: this.getErrorMessage('max', jobRoleTitleInLowerCase),
          },
          {
            name: 'pattern',
            message: this.getErrorMessage('pattern', jobRoleTitleInLowerCase),
          },
        ],
      });
    });
  }

  protected createDynamicErrorMessaging(): void {
    this.updateJobRoleErrorMessages();
  }

  protected updateJobRoleErrorMessages(): void {
    const jobRoleErrorMessages = {};

    this.selectedJobRoles.forEach((job, index) => {
      const errors = this.jobRoleNumbers.at(index).errors;
      if (!errors) {
        return;
      }
      const errorType = Object.keys(errors)[0];
      jobRoleErrorMessages[job.jobId] = this.getErrorMessage(errorType);
    });

    this.jobRoleErrorMessages = jobRoleErrorMessages;
  }
}
