import { Component } from '@angular/core';
import { jobOptionsEnum } from '@core/model/establishment.model';
import {
  UpdateStartersLeaversVacanciesDirective,
} from '@shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-update-starters',
  templateUrl:
    '../../../../shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.html',
  styleUrl:
    '../../../../shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.scss',
})
export class UpdateStartersComponent extends UpdateStartersLeaversVacanciesDirective {
  public revealText =
    "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";

  protected setupTexts(): void {
    const dateToday = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    if (this.isAFreshWorkplace) {
      this.heading = `Add the number of staff who've started SINCE ${dateToday}`;
      this.addJobRoleButtonText = 'Add job roles';
    } else {
      this.heading = `Update the number of staff who've started SINCE ${dateToday}`;
      this.addJobRoleButtonText = 'Add more job roles';
    }

    this.reminderText = `Remember to <strong>SUBTRACT</strong> or <strong>REMOVE</strong> any staff who started <strong>before ${dateToday}</strong>.`;
    this.radioButtonOptions = [
      {
        label: `No staff started on or after ${dateToday}`,
        value: jobOptionsEnum.NONE,
      },
      {
        label: `I do not know how many staff started on or after ${dateToday}`,
        value: jobOptionsEnum.DONT_KNOW,
      },
    ];
  }
}
