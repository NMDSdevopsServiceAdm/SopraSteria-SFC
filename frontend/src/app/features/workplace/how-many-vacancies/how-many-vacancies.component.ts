import { Component } from '@angular/core';
import { UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';

import { HowManyStartersLeaversVacanciesDirective } from '../vacancies-and-turnover/how-many-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-how-many-vacancies',
  templateUrl: '../vacancies-and-turnover/how-many-starters-leavers-vacancies.html',
  styleUrls: ['../vacancies-and-turnover/how-many-starters-leavers-vacancies.scss'],
  standalone: false,
})
export class HowManyVacanciesComponent extends HowManyStartersLeaversVacanciesDirective {
  public heading = 'How many current staff vacancies do you have?';
  public instruction = 'Only add the number of vacancies for permanent and temporary job roles.';
  public revealTextContent =
    'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
  public jobRoleType = 'vacancies';
  public fieldName = 'vacancies';
  public fieldJobRoles = 'vacanciesJobRoles';
  public jobRolesTableTitle = 'Current staff vacancies';
  public totalNumberDescription = 'Total number of vacancies';

  protected selectedJobRoles: Array<Vacancy> = [];

  protected clearLocalStorageData(): void {
    localStorage.removeItem('hasVacancies');
    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
  }

  protected getSelectedJobRoleFromService(): Vacancy[] {
    return this.vacanciesAndTurnoverService.selectedVacancies;
  }

  protected saveSelectedJobRolesToService(): void {
    this.vacanciesAndTurnoverService.selectedVacancies = this.jobRoleNumbersTable.currentValues;
  }

  protected returnToFirstPage(): void {
    this.navigateToQuestionPage('do-you-have-vacancies');
  }

  protected returnToJobRoleSelectionPage(): void {
    this.navigateToQuestionPage('select-vacancy-job-roles');
  }

  protected setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'select-vacancy-job-roles'];
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const updatedVacancies = this.selectedJobRoles.map((job, index) => {
      const fieldsToUpdate: Vacancy = {
        jobId: Number(job.jobId),
        total: parseInt(this.jobRoleNumbers.value[index]),
      };
      return fieldsToUpdate;
    });

    return { vacancies: updatedVacancies };
  }

  protected onSuccess(): void {
    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
    this.nextRoute = ['/workplace', this.establishment.uid, 'do-you-have-starters'];
  }
}
