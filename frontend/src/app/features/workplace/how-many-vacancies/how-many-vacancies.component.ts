import { Component } from '@angular/core';
import { UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';

import { HowManyStartersLeaversVacanciesDirective } from '../vacancies-and-turnover/how-many-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-how-many-vacancies',
  templateUrl: '../vacancies-and-turnover/how-many-starters-leavers-vacancies.html',
  styleUrls: ['../vacancies-and-turnover/how-many-starters-leavers-vacancies.scss'],
})
export class HowManyVacanciesComponent extends HowManyStartersLeaversVacanciesDirective {
  public heading = 'How many current staff vacancies do you have for each job role?';
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
  }

  protected returnToFirstPage(): void {
    this.router.navigate(['/workplace', `${this.establishment.uid}`, 'do-you-have-vacancies']);
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
      if (job.other) {
        fieldsToUpdate.other = job.other;
      }
      return fieldsToUpdate;
    });

    return { vacancies: updatedVacancies };
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'do-you-have-starters'];
  }
}
