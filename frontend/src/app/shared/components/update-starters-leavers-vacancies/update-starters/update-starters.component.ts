import { Component } from '@angular/core';
import { jobOptionsEnum } from '@core/model/establishment.model';
import { WorkplaceUpdatePage } from '@core/services/vacancies-and-turnover.service';
import { UpdateStartersLeaversVacanciesDirective } from '@shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-update-starters',
  templateUrl: '../../../directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.html',
  standalone: false,
})
export class UpdateStartersComponent extends UpdateStartersLeaversVacanciesDirective {
  public totalNumberDescription = 'Total number of starters';
  public tableTitle = 'Starters in the last 12 months';
  public revealText =
    "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";

  public serverErrorMessage = 'Failed to update starters';
  public noOrDoNotKnowErrorMessage = 'Select no staff started or do not know';
  public numberRequiredErrorMessage = 'Enter the number of starters or remove';
  public validNumberErrorMessage = 'Number of starters must be between 1 and 999';
  public addExplanationMessage = 'Only add the number of starters in permanent and temporary job roles.';

  protected slvField = 'starters';
  protected updateJobRolePage = 'update-starter-job-roles';
  protected selectedField = 'selectedStarters';
  protected updatePage = WorkplaceUpdatePage.UPDATE_STARTERS;

  protected setupTexts(): void {
    const todayOneYearAgo = this.getDateForOneYearAgo();

    if (!this.questionPreviouslyAnswered) {
      this.heading = `Add the number of staff who've started SINCE ${todayOneYearAgo}`;
      this.addJobRoleButtonText = 'Add job roles';
    } else {
      this.heading = `Update the number of staff who've started SINCE ${todayOneYearAgo}`;
      this.addJobRoleButtonText = 'Add more job roles';
    }

    this.reminderText = `Remember to <strong>SUBTRACT</strong> or <strong>REMOVE</strong> any staff who started <br><strong>before ${todayOneYearAgo}</strong>.`;
    this.radioButtonOptions = [
      {
        label: `No staff started on or after ${todayOneYearAgo}`,
        value: jobOptionsEnum.NONE,
      },
      {
        label: `I do not know if any staff started on or after ${todayOneYearAgo}`,
        value: jobOptionsEnum.DONT_KNOW,
      },
    ];

    this.messageWhenNoJobRoleSelected = {
      None: `No staff started on or after ${todayOneYearAgo}.`,
      DoNotKnow: `You do not know if any staff started on or after ${todayOneYearAgo}.`,
      Default: `You've not added any staff who've started since ${todayOneYearAgo}.`,
    };
  }
}
