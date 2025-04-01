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
  public serverErrorMessage = 'Failed to update starters';

  protected setupTexts(): void {
    const todayOneYearAgo = this.getDateForOneYearAgo();

    if (!this.questionPreviouslyAnswered) {
      this.heading = `Add the number of staff who've started SINCE ${todayOneYearAgo}`;
      this.addJobRoleButtonText = 'Add job roles';
    } else {
      this.heading = `Update the number of staff who've started SINCE ${todayOneYearAgo}`;
      this.addJobRoleButtonText = 'Add more job roles';
    }

    this.reminderText = `Remember to <strong>SUBTRACT</strong> or <strong>REMOVE</strong> any staff who started <strong>before ${todayOneYearAgo}</strong>.`;
    this.radioButtonOptions = [
      {
        label: `No staff started on or after ${todayOneYearAgo}`,
        value: jobOptionsEnum.NONE,
      },
      {
        label: `I do not know how many staff started on or after ${todayOneYearAgo}`,
        value: jobOptionsEnum.DONT_KNOW,
      },
    ];

    this.messageWhenNoJobRoleSelected = {
      None: `No staff started on or after ${todayOneYearAgo}.`,
      DoNotKnow: `You do not know how many staff started on or after ${todayOneYearAgo}.`,
      Default: `You've not added any staff who've started since ${todayOneYearAgo}.`,
    };
  }

  private getDateForOneYearAgo(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);

    return today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
