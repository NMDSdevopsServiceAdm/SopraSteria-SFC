import { Component } from '@angular/core';
import { Leaver, Starter, UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';

import { HowManyStartersLeaversVacanciesDirective } from '../vacancies-and-turnover/how-many-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-how-many-vacancies',
  templateUrl: '../vacancies-and-turnover/how-many-starters-leavers-vacancies.html',
  styleUrls: ['../vacancies-and-turnover/how-many-starters-leavers-vacancies.scss'],
})
export class HowManyVacanciesComponent extends HowManyStartersLeaversVacanciesDirective {
  public heading = 'How many current staff vacancies do you have?';
  public instruction = 'Only add the number of vacancies for permanent and temporary job roles.';
  public revealTextContent =
    'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
  public jobRoleType = 'vacancies';
  public fieldName = 'vacancies';
  public fieldJobRoles = 'vacanciesJobRoles';

  protected selectedJobRoles: Array<Vacancy> = [];

  protected clearLocalStorageData(): void {
    localStorage.removeItem('hasVacancies');
    localStorage.removeItem('vacanciesJobRoles');
    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
  }

  public loadSelectedJobRoles(): void {
    try {
      this.selectedJobRoles = this.getSelectedJobRoleFromService();
      if (!this.selectedJobRoles) {
        this.selectedJobRoles = this.establishment[this.fieldName];
      }
    } catch (err) {
      this.returnToFirstPage();
    }
    if (!Array.isArray(this.selectedJobRoles) || this.selectedJobRoles?.length === 0) {
      this.returnToFirstPage();
    }

    this.selectedJobRoles = this.replaceNullWithOne(this.selectedJobRoles);
  }

  protected getSelectedJobRoleFromService(): Vacancy[] {
    return this.vacanciesAndTurnoverService.selectedVacancies;
  }

  protected replaceNullWithOne(selectedJobRoles: Array<Vacancy | Starter | Leaver>): Array<Vacancy | Starter | Leaver> {
    return selectedJobRoles.map((job) => {
      const updatedNumber = job.total ?? 1;
      return { ...job, total: updatedNumber };
    });
  }

  public saveSelectedJobRolesToService(): void {
    this.vacanciesAndTurnoverService.selectedVacancies = this.jobRoleNumbersTable.currentValues;
  }

  protected returnToFirstPage(): void {
    this.router.navigate(['/workplace', `${this.establishment.uid}`, 'do-you-have-vacancies']);
  }

  protected returnToJobRoleSelectionPage(): void {
    this.router.navigate(['/workplace', `${this.establishment.uid}`, 'select-vacancy-job-roles']);
  }

  protected setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'select-vacancy-job-roles'];
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
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'do-you-have-starters'];
  }

  protected createDynamicErrorMessaging(): void {
    this.updateJobRoleErrorMessages();
  }

  protected updateJobRoleErrorMessages(): void {
    const jobRoleErrorMessages = {};

    this.selectedJobRoles.forEach((job, index) => {
      const errors = this.jobRoleNumbers.at(index).errors;
      if (!errors) {
        return null;
      }
      const errorType = Object.keys(errors)[0];
      jobRoleErrorMessages[job.jobId] = this.getErrorMessage(errorType);
    });

    this.jobRoleErrorMessages = jobRoleErrorMessages;
  }
}
