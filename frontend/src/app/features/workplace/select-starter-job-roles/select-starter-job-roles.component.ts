import { Component } from '@angular/core';
import { Starter } from '@core/model/establishment.model';
import { SelectJobRolesDirective } from '@features/workplace/vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-starter-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectStarterJobRolesComponent extends SelectJobRolesDirective {
  public errorMessageOnEmptyInput = 'Select job roles for the starters you want to add';
  public heading = 'Select job roles for the starters you want to add';
  protected hasStartersLeaversVacanciesField = 'hasStarters';
  protected prefillData: Starter[] = [];
  protected field = 'starters';
  public hintText = 'You can review the number of starters for each role after you click Save and continue.';

  protected getSelectedJobRoleFromService(): Starter[] {
    return this.vacanciesAndTurnoverService.selectedStarters;
  }
  protected saveToService(updatedJobRoles: Starter[]): void {
    this.vacanciesAndTurnoverService.selectedStarters = updatedJobRoles;
  }
}
