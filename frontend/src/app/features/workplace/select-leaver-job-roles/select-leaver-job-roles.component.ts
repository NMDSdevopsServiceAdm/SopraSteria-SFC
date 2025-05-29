import { Component } from '@angular/core';
import { Leaver } from '@core/model/establishment.model';

import { SelectJobRolesDirective } from '../vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-leaver-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectLeaverJobRolesComponent extends SelectJobRolesDirective {
  public errorMessageOnEmptyInput = 'Select job roles for the leavers you want to add';
  public heading = 'Select job roles for the leavers you want to add';
  public hintText = 'You can review the number of leavers for each role after you click Save and continue.';
  protected numbersField = 'leaversJobRoles';
  protected hasStartersLeaversVacanciesField = 'hasLeavers';
  protected prefillData: Leaver[] = [];
  protected field = 'leavers';

  protected getSelectedJobRoleFromService(): Leaver[] {
    return this.vacanciesAndTurnoverService.selectedLeavers;
  }
  protected saveToService(updatedJobRoles: Leaver[]): void {
    this.vacanciesAndTurnoverService.selectedLeavers = updatedJobRoles;
  }
}
