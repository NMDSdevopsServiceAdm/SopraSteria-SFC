import { Component } from '@angular/core';
import { UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';

import { HowManyStartersLeaversVacanciesDirective } from '../vacancies-and-turnover/how-many-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-how-many-vacancies',
  templateUrl: '../vacancies-and-turnover/how-many-starters-leavers-vacancies.html',
})
export class HowManyVacanciesComponent extends HowManyStartersLeaversVacanciesDirective {
  public heading = 'How many current staff vacancies do you have for each job role?';
  public section = 'Vacancies and turnover';
  public instruction = 'Only add the number of vacancies for permanent and temporary job roles.';
  public revealTextContent =
    'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
  public jobRoleType = 'vacancies';

  protected localStorageKey = 'updated-vacancies';
  protected selectedJobRoles: Array<Vacancy> = [];

  public loadSelectedJobRoles(): void {
    try {
      const loadedData = JSON.parse(localStorage.getItem(this.localStorageKey));
      this.selectedJobRoles = loadedData?.vacancies;
    } catch (err) {
      this.returnToFirstPage();
    }

    if (!Array.isArray(this.selectedJobRoles) || this.selectedJobRoles?.length === 0) {
      this.returnToFirstPage();
    }
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
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'starters'];
    // TODO: change to 'do-you-have-starters' page after #1560 complete
  }
}