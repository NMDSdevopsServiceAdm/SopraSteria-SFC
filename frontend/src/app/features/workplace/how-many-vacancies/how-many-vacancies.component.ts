import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, Validators } from '@angular/forms';
import { Vacancy } from '@core/model/establishment.model';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-how-many-vacancies',
  templateUrl: './how-many-vacancies.component.html',
})
export class HowManyVacanciesComponent extends Question implements OnInit, OnDestroy {
  // public errorMessageOnEmptyInput = 'Select job roles for all your current staff vacancies';
  public heading = 'How many current staff vacancies do you have for each job role?';
  public section = 'Vacancies and turnover';
  protected localStorageKey = 'updated-vacancies';
  private selectedJobRoles: Array<Vacancy> = [];
  public totalVacancies: number = 0;
  private minNumber = 1;
  private maxNumber = 999;

  protected init(): void {
    this.loadSelectedJobRoles();
    this.setupForm();
  }

  protected loadSelectedJobRoles() {
    const loadedData = JSON.parse(localStorage.getItem(this.localStorageKey));
    if (Array.isArray(loadedData?.vacancies)) {
      this.selectedJobRoles = loadedData.vacancies;
    }

    // if (!this.selectedJobRoles)  jump to 1st page
  }

  protected setupForm() {
    this.form = this.formBuilder.group({
      vacancyNumbers: this.formBuilder.array([]),
    });
    this.selectedJobRoles.forEach((jobRole) => {
      this.vacancyNumbers.push(
        this.formBuilder.control(jobRole.total, [
          Validators.required,
          Validators.min(this.minNumber),
          Validators.max(this.maxNumber),
        ]),
      );
    });

    this.subscriptions.add(
      this.vacancyNumbers.valueChanges.subscribe(() => {
        this.updateTotalNumber();
      }),
    );
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [];

    this.vacancyNumbers.controls.forEach((_, index) => {
      const jobRoleTitle = this.selectedJobRoles[index].title.toLowerCase();
      this.formErrorsMap.push({
        item: `vacancyNumbers.${index}`,
        type: [
          {
            name: 'required',
            message: `Enter the number of vacancies (${jobRoleTitle})`,
          },
          {
            name: 'min',
            message: `Number of vacancies must be between ${this.minNumber} and ${this.maxNumber} (${jobRoleTitle})`,
          },
          {
            name: 'max',
            message: `Number of vacancies must be between ${this.minNumber} and ${this.maxNumber} (${jobRoleTitle})`,
          },
        ],
      });
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  get vacancyNumbers(): UntypedFormArray {
    return this.form.get('vacancyNumbers') as UntypedFormArray;
  }

  updateTotalNumber() {
    const inputValues = this.vacancyNumbers.value as Array<number | null>;
    this.totalVacancies = inputValues.reduce((total, current) => (current ? total + current : total), 0);
  }
}
