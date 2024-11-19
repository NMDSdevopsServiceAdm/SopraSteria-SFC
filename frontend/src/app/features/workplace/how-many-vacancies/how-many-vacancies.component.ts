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
      vacancies: this.formBuilder.array([]),
    });
    this.selectedJobRoles.forEach((jobRole) => {
      this.vacancies.push(
        this.formBuilder.control(jobRole.total, [
          Validators.required,
          Validators.min(this.minNumber),
          Validators.max(this.maxNumber),
        ]),
      );
    });

    this.subscriptions.add(
      this.vacancies.valueChanges.subscribe(() => {
        this.updateTotalNumber();
      }),
    );
  }

  get vacancies(): UntypedFormArray {
    return this.form.get('vacancies') as UntypedFormArray;
  }

  updateTotalNumber() {
    const inputValues = this.vacancies.value as Array<number | null>;
    this.totalVacancies = inputValues.reduce((total, current) => (current ? total + current : total), 0);
  }
}
