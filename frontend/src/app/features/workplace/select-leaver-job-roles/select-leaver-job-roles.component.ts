import { Component } from '@angular/core';
import { Leaver } from '@core/model/establishment.model';

import { SelectJobRolesDirective } from '../vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-leaver-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectLeaverJobRolesComponent extends SelectJobRolesDirective {
  public errorMessageOnEmptyInput = 'Select job roles of all your staff leavers';
  public heading = 'Select job roles of all your staff leavers';
  protected localStorageKey = 'leaversJobRoles';
  protected prefillData: Leaver[] = [];
  protected field = 'leavers';
}
