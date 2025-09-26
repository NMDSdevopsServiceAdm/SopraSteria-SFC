import { Component } from '@angular/core';
import { jobOptionsEnum } from '@core/model/establishment.model';
import { WorkplaceUpdatePage } from '@core/services/vacancies-and-turnover.service';
import {
  UpdateStartersLeaversVacanciesDirective,
} from '@shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.directive';

@Component({
    selector: 'app-update-leavers',
    templateUrl: '../../../directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.html',
    standalone: false
})
export class UpdateLeaversComponent extends UpdateStartersLeaversVacanciesDirective {
  protected slvField = 'leavers';
  protected selectedField = 'selectedLeavers';
  public revealText =
    'To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions.';
  public tableTitle = 'Leavers in the last 12 months';
  public totalNumberDescription = 'Total number of leavers';
  public noOrDoNotKnowErrorMessage = 'Select no staff left or do not know';
  public numberRequiredErrorMessage = 'Enter the number of leavers or remove';
  public validNumberErrorMessage = 'Number of leavers must be between 1 and 999';
  public serverErrorMessage = 'Failed to update leavers';
  public addExplanationMessage = 'Only add the number of leavers who left permanent and temporary job roles.';

  protected updatePage = WorkplaceUpdatePage.UPDATE_LEAVERS;

  protected setupTexts(): void {
    const todayOneYearAgo = this.getDateForOneYearAgo();

    this.reminderText = `Remember to <strong>SUBTRACT</strong> or <strong>REMOVE</strong> any staff who left <br><strong>before ${todayOneYearAgo}</strong>.`;

    const headingBaseText = `the number of staff who've left SINCE ${todayOneYearAgo}`;

    if (this.questionPreviouslyAnswered) {
      this.addJobRoleButtonText = 'Add more job roles';
      this.heading = `Update ${headingBaseText}`;
    } else {
      this.addJobRoleButtonText = 'Add job roles';
      this.heading = `Add ${headingBaseText}`;
    }

    this.radioButtonOptions = [
      {
        label: `No staff left on or after ${todayOneYearAgo}`,
        value: jobOptionsEnum.NONE,
      },
      {
        label: `I do not know if any staff left on or after ${todayOneYearAgo}`,
        value: jobOptionsEnum.DONT_KNOW,
      },
    ];

    this.messageWhenNoJobRoleSelected = {
      None: `No staff left on or after ${todayOneYearAgo}.`,
      DoNotKnow: `You do not know if any staff left on or after ${todayOneYearAgo}.`,
      Default: `You've not added any staff who've left SINCE ${todayOneYearAgo}.`,
    };
  }
}
