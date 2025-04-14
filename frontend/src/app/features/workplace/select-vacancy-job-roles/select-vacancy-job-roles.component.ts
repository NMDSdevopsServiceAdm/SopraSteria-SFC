import { Component, OnDestroy, OnInit } from '@angular/core';
import { Vacancy } from '@core/model/establishment.model';

import { SelectJobRolesDirective } from '../vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-vacancy-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectVacancyJobRolesComponent extends SelectJobRolesDirective implements OnInit, OnDestroy {
  public errorMessageOnEmptyInput = 'Select job roles for the vacancies you want to add';
  public heading = 'Select job roles for the vacancies you want to add';
  public hintText = 'You can review the number of vacancies for each role after you click Save and continue.';
  protected numbersField = 'vacanciesJobRoles';
  protected hasStartersLeaversVacanciesField = 'hasVacancies';
  protected prefillData: Vacancy[] = [];
  protected field = 'vacancies';

  protected getPrefillData(): void {
    const previousData = this.vacanciesAndTurnoverService.selectedVacancies;
    if (Array.isArray(previousData)) {
      this.prefillData = previousData;
    } else if (Array.isArray(this.establishment[this.field])) {
      this.prefillData = this.establishment[this.field] as Array<Vacancy>;
    }
  }

  protected onSuccess(): void {
    const selectedJobIds: number[] = this.form.get('selectedJobRoles').value;

    const updatedJobRoles: Vacancy[] = selectedJobIds.map((jobId) => {
      const job = this.jobsAvailable.find((job) => job.id === jobId);
      const fieldCount = this.prefillData.find((field) => field.jobId === jobId)?.total ?? null;

      return { jobId, title: job.title, total: fieldCount };
    });
    this.vacanciesAndTurnoverService.selectedVacancies = updatedJobRoles;
  }

  protected clearLocalStorageData(): void {
    localStorage.removeItem(this.hasStartersLeaversVacanciesField);
    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
  }
}
