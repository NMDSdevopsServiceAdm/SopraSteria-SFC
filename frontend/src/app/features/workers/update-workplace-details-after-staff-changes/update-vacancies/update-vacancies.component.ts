import { Component } from '@angular/core';
import { jobOptionsEnum } from '@core/model/establishment.model';
import {
  UpdateStartersLeaversVacanciesDirective,
} from '@shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-update-vacancies',
  templateUrl:
    '../../../../shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.html',
  styleUrl:
    '../../../../shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.scss',
})
export class UpdateVacanciesComponent extends UpdateStartersLeaversVacanciesDirective {
  public revealText =
    'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
  public reminderText = `Remember to <strong>SUBTRACT</strong> or <strong>REMOVE</strong> any that are <strong>no longer vacancies</strong>.`;
  public totalNumberDescription = 'Total number of vacancies';
  public radioButtonOptions = [
    {
      label: 'There are no current staff vacancies',
      value: jobOptionsEnum.NONE,
    },
    {
      label: 'I do not know if there are any current staff vacancies',
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];
  public messageWhenNoJobRoleSelected = {
    None: 'There are no current staff vacancies.',
    DoNotKnow: 'You do not know if there are any current staff vacancies.',
    Default: "You've not added any current staff vacancies.",
  };

  protected setupTexts(): void {
    if (this.isAFreshWorkplace) {
      this.heading = 'Add your current staff vacancies';
      this.addJobRoleButtonText = 'Add job roles';
    } else {
      this.heading = 'Update your current staff vacancies';
      this.addJobRoleButtonText = 'Add more job roles';
    }
  }
}
