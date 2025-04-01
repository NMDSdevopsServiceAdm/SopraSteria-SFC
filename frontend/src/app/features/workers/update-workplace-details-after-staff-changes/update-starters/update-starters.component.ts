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
  public totalNumberDescription = 'Total number of starters';
  public tableTitle = 'Starters in the last 12 months';
  public revealText =
    "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";

  protected setupTexts(): void {
    const dateToday = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!this.questionPreviouslyAnswered) {
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

    this.messageWhenNoJobRoleSelected = {
      None: `No staff started on or after ${dateToday}.`,
      DoNotKnow: `You do not know how many staff started on or after ${dateToday}.`,
      Default: `You've not added any staff who've started since ${dateToday}.`,
    };
  }
}
