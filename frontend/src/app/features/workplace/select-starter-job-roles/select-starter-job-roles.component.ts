import { Component } from '@angular/core';
import { Starter } from '@core/model/establishment.model';
import { SelectJobRolesDirective } from '@features/workplace/vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-starter-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectStarterJobRolesComponent extends SelectJobRolesDirective {
  public errorMessageOnEmptyInput = 'Select job roles for all your new starters';
  public heading = 'Select job roles for all your new starters';
  protected numbersField = 'startersJobRoles';
  protected hasStartersLeaversVacanciesField = 'hasStarters';
  protected prefillData: Starter[] = [];
  protected field = 'starters';
}
