import { Component, OnDestroy, OnInit } from '@angular/core';
import { Vacancy } from '@core/model/establishment.model';

import { SelectJobRolesDirective } from '../vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-vacancy-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectVacancyJobRolesComponent extends SelectJobRolesDirective implements OnInit, OnDestroy {
  public errorMessageOnEmptyInput = 'Select job roles for all your current staff vacancies';
  public heading = 'Select job roles for all your current staff vacancies';
  protected numbersField = 'vacanciesJobRoles';
  protected hasStartersLeaversVacanciesField = 'hasVacancies';
  protected prefillData: Vacancy[] = [];
  protected field = 'vacancies';
}
