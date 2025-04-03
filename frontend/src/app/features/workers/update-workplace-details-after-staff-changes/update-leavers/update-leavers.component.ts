import { Component } from '@angular/core';
import { jobOptionsEnum } from '@core/model/establishment.model';
import { FormatUtil } from '@core/utils/format-util';
import { UpdateStartersLeaversVacanciesDirective } from '@shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-update-leavers',
  templateUrl:
    '../../../../shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.html',
  styleUrl:
    '../../../../shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.scss',
})

export class UpdateLeaversComponent extends UpdateStartersLeaversVacanciesDirective {

  protected setupTexts(): void {
  const todayOneYearAgo = this.getDateForOneYearAgo();
  this.heading = `Update the number of staff who've left SINCE ${todayOneYearAgo}`
  this.revealText = "To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions."
  this.reminderText = `Remember to <strong>SUBTRACT</strong> or <strong>REMOVE</strong> any staff who left <strong>before ${todayOneYearAgo}</strong>`
  this.tableTitle = "Leavers in the last 12 months"
  this.addJobRoleButtonText = "Add more job roles"

  this.radioButtonOptions = [
        {
          label: `No staff left on or after ${todayOneYearAgo}`,
          value: jobOptionsEnum.NONE,
        },
        {
          label: `I do not know how many staff left on or after ${todayOneYearAgo}`,
          value: jobOptionsEnum.DONT_KNOW,
        },
      ];

  this.messageWhenNoJobRoleSelected = {
    None: ``,
    DoNotKnow: ``,
    Default: ''
  }}

  private getDateForOneYearAgo(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);

    return FormatUtil.formatDateToLocaleDateString(today);
  }
}
