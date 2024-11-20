import { Directive, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, Validators } from '@angular/forms';
import { Leaver, Starter, UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';

import { Question } from '../question/question.component';

@Directive()
export class HowManyStartersLeaversVacanciesDirective extends Question implements OnInit, OnDestroy {
  public heading: string;
  public section: string;
  public instruction: string;
  public revealTextContent: string;
  public jobRoleType: string;
  public totalNumber = 0;

  protected selectedJobRoles: Array<Starter | Leaver | Vacancy> = [];

  private minNumberPerJobRole = 1;
  private maxNumberPerJobRole = 999;

  protected init(): void {
    this.loadSelectedJobRoles();
    this.setPreviousRoute();
    this.setupForm();
  }

  public loadSelectedJobRoles(): void {}

  protected clearLocalStorageData(): void {}

  protected returnToFirstPage(): void {}

  protected setPreviousRoute(): void {}

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      jobRoleNumbers: this.formBuilder.array([]),
    });

    this.selectedJobRoles.forEach((jobRole) => {
      const initialValue = jobRole.total ?? '';
      this.jobRoleNumbers.push(
        this.formBuilder.control(initialValue, [
          Validators.required,
          Validators.min(this.minNumberPerJobRole),
          Validators.max(this.maxNumberPerJobRole),
        ]),
      );
    });

    this.updateTotalNumber();

    this.subscriptions.add(
      this.jobRoleNumbers.valueChanges.subscribe(() => {
        this.updateTotalNumber();
      }),
    );
  }

  get jobRoleNumbers(): UntypedFormArray {
    return this.form.get('jobRoleNumbers') as UntypedFormArray;
  }

  updateTotalNumber(): void {
    const inputValues = this.jobRoleNumbers.value as Array<number | null>;
    this.totalNumber = inputValues.reduce((total, current) => (current ? total + current : total), 0);
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

  public setBackLink() {
    this.back = { url: this.previousRoute };
    this.backService.setBackLink(this.back);
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
            message: `Enter the number of ${this.jobRoleType} (${jobRoleTitle})`,
          },
          {
            name: 'min',
            message: `Number of ${this.jobRoleType} must be between ${this.minNumberPerJobRole} and ${this.maxNumberPerJobRole} (${jobRoleTitle})`,
          },
          {
            name: 'max',
            message: `Number of ${this.jobRoleType} must be between ${this.minNumberPerJobRole} and ${this.maxNumberPerJobRole} (${jobRoleTitle})`,
          },
        ],
      });
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
}
