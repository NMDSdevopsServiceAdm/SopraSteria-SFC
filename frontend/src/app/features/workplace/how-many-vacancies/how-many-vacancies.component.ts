import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, Validators } from '@angular/forms';
import { UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-how-many-vacancies',
  templateUrl: './how-many-vacancies.component.html',
})
export class HowManyVacanciesComponent extends Question implements OnInit, OnDestroy {
  public heading = 'How many current staff vacancies do you have for each job role?';
  public section = 'Vacancies and turnover';
  public totalVacancies: number = 0;

  protected localStorageKey = 'updated-vacancies';

  private selectedJobRoles: Array<Vacancy> = [];
  private minNumber = 1;
  private maxNumber = 999;

  protected init(): void {
    this.loadSelectedJobRoles();
    this.setPreviousRoute();
    this.setupForm();
  }

  public loadSelectedJobRoles(): void {
    try {
      const loadedData = JSON.parse(localStorage.getItem(this.localStorageKey));
      this.selectedJobRoles = loadedData?.vacancies;
    } catch (err) {
      this.returnToFirstPage();
    }

    if (!(Array.isArray(this.selectedJobRoles) && this.selectedJobRoles?.length)) {
      this.returnToFirstPage();
    }
  }

  protected returnToFirstPage(): void {
    this.router.navigate(['/workplace', `${this.establishment.uid}`, 'do-you-have-vacancies']);
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'select-vacancy-job-roles'];
  }

  protected setupForm(): void {
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

  get vacancyNumbers(): UntypedFormArray {
    return this.form.get('vacancyNumbers') as UntypedFormArray;
  }

  updateTotalNumber(): void {
    const inputValues = this.vacancyNumbers.value as Array<number | null>;
    this.totalVacancies = inputValues.reduce((total, current) => (current ? total + current : total), 0);
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const updatedVacancies = this.selectedJobRoles.map((job, index) => {
      const updatedFields: Vacancy = {
        jobId: Number(job.jobId),
        total: parseInt(this.vacancyNumbers.value[index]),
      };
      if (job.other) {
        updatedFields.other = job.other;
      }
      return updatedFields;
    });

    return { vacancies: updatedVacancies };
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
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'starters'];
    // TODO: change to 'do-you-have-starters' page after #1560 complete
    this.clearLocalStorageData();
  }

  protected clearLocalStorageData(): void {
    localStorage.removeItem(this.localStorageKey);
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
}
