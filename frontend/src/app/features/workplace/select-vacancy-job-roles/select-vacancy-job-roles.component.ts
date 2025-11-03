import { Component, OnDestroy, OnInit } from '@angular/core';
import { Vacancy } from '@core/model/establishment.model';

import { SelectJobRolesDirective } from '../vacancies-and-turnover/select-job-roles.directive';

@Component({
    selector: 'app-select-vacancy-job-roles',
    templateUrl: '../vacancies-and-turnover/select-job-roles.html',
    standalone: false
})
export class SelectVacancyJobRolesComponent extends SelectJobRolesDirective implements OnInit, OnDestroy {
  public errorMessageOnEmptyInput = 'Select job roles for the vacancies you want to add';
  public heading = 'Select job roles for the vacancies you want to add';
  public hintText = 'You can review the number of vacancies for each role after you click Save and continue.';
  protected numbersField = 'vacanciesJobRoles';
  protected hasStartersLeaversVacanciesField = 'hasVacancies';
  protected prefillData: Vacancy[] = [];
  protected field = 'vacancies';

  protected getSelectedJobRoleFromService(): Vacancy[] {
    return this.vacanciesAndTurnoverService.selectedVacancies;
  }
  protected saveToService(updatedJobRoles: Vacancy[]): void {
    this.vacanciesAndTurnoverService.selectedVacancies = updatedJobRoles;
  }
}
