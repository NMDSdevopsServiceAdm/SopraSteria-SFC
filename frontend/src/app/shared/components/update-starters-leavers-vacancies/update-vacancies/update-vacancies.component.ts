import { Component } from '@angular/core';
import { jobOptionsEnum } from '@core/model/establishment.model';
import { WorkplaceUpdatePage } from '@core/services/vacancies-and-turnover.service';
import { UpdateStartersLeaversVacanciesDirective } from '@shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-update-vacancies',
  templateUrl: '../../../directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.html',
  standalone: false,
})
export class UpdateVacanciesComponent extends UpdateStartersLeaversVacanciesDirective {
  public revealText =
    'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
  public reminderText = `Remember to <strong>SUBTRACT</strong> or <strong>REMOVE</strong> any that are <br><strong>no longer vacancies</strong>.`;
  public tableTitle = 'Current staff vacancies';
  public totalNumberDescription = 'Total number of vacancies';

  public serverErrorMessage = 'Failed to update current staff vacancies';
  public noOrDoNotKnowErrorMessage = 'Select there are no current staff vacancies or do not know';
  public numberRequiredErrorMessage = 'Enter the number of current staff vacancies or remove';
  public validNumberErrorMessage = 'Number of vacancies must be between 1 and 999';
  public addExplanationMessage = 'Only add the number of vacancies for permanent and temporary job roles.';

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

  protected slvField = 'vacancies';
  protected updateJobRolePage = 'update-vacancy-job-roles';
  protected selectedField = 'selectedVacancies';
  protected updatePage = WorkplaceUpdatePage.UPDATE_VACANCIES;

  protected setupTexts(): void {
    if (!this.questionPreviouslyAnswered) {
      this.heading = 'Add your current staff vacancies';
      this.addJobRoleButtonText = 'Add job roles';
    } else {
      this.heading = 'Update your current staff vacancies';
      this.addJobRoleButtonText = 'Add more job roles';
    }
  }
}
