import { Directive, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { Leaver, Starter, UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { sum } from 'lodash';

import { Question } from '../question/question.component';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService } from '../../../core/services/vacancies-and-turnover.service';

@Directive()
export class HowManyStartersLeaversVacanciesDirective extends Question implements OnInit, OnDestroy {
  @ViewChildren('numberInputRef') numberInputs: QueryList<ElementRef<HTMLInputElement>>;
  public heading: string;
  public instruction: string;
  public revealTextContent: string;
  public jobRoleType: string;
  public fieldName: string;
  public fieldJobRoles: string;
  public section: string = WorkplaceFlowSections.VACANCIES_AND_TURNOVER;
  public totalNumber = 0;

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
          ],
          updateOn: 'submit',
        }),
      );
    });

    const inputValues = this.jobRoleNumbers.value as Array<number | null>;
    this.totalNumber = inputValues.reduce((total, current) => (current ? total + current : total), 0);
  }

  get jobRoleNumbers(): UntypedFormArray {
    return this.form.get('jobRoleNumbers') as UntypedFormArray;
  }

  protected updateTotalNumber(): void {
    const nativeNumberInputs = this.numberInputs.map((ref) => ref.nativeElement);
    const inputValues = nativeNumberInputs.map((input) => (input.value ? parseInt(input.value) : 0));
    this.totalNumber = sum(inputValues);
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

  protected navigate(): void {
    const action = this.submitAction.action;

    if (['continue', 'exit', 'return'].includes(action)) {
      this.clearLocalStorageData();
    }

    super.navigate();
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
        return `Number of ${this.jobRoleType} must be between ${this.minNumberPerJobRole} and ${this.maxNumberPerJobRole}${jobRoleTitleSuffix}`;
    }
  }

  public loadSelectedJobRoles(): void {
    try {
      const loadedJobRoles = JSON.parse(localStorage.getItem(this.fieldJobRoles));
      this.selectedJobRoles = loadedJobRoles?.[this.fieldName];
      if (!this.selectedJobRoles) {
        this.selectedJobRoles = this.establishment[this.fieldName];
      }
    } catch (err) {
      this.returnToFirstPage();
    }

    if (!Array.isArray(this.selectedJobRoles) || this.selectedJobRoles?.length === 0) {
      this.returnToFirstPage();
    }
  }

  public saveSelectedJobRoles(): void {}

  protected handleAddJobRole(): void {
    this.saveSelectedJobRoles();
    this.returnToJobRoleSelectionPage();
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [];

    this.jobRoleNumbers.controls.forEach((_, index) => {
      const jobRoleTitle = this.selectedJobRoles[index].title.toLowerCase();
      this.formErrorsMap.push({
        item: `jobRoleNumbers.${index}`,
        type: [
          {
            name: 'required',
            message: this.getErrorMessage('required', jobRoleTitle),
          },
          {
            name: 'min',
            message: this.getErrorMessage('min', jobRoleTitle),
          },
          {
            name: 'max',
            message: this.getErrorMessage('max', jobRoleTitle),
          },
        ],
      });
    });
  }

  public getInlineErrorMessage(formControlItemKey: string): string {
    const errorType = Object.keys(this.form.get(formControlItemKey).errors)[0];
    return this.getErrorMessage(errorType);
  }
}
