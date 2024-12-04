import { Component } from '@angular/core';
import { Starter, UpdateJobsRequest } from '@core/model/establishment.model';

import { HowManyStartersLeaversVacanciesDirective } from '../vacancies-and-turnover/how-many-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-how-many-starters',
  templateUrl: '../vacancies-and-turnover/how-many-starters-leavers-vacancies.html',
  styleUrls: ['../vacancies-and-turnover/how-many-starters-leavers-vacancies.scss'],
})
export class HowManyStartersComponent extends HowManyStartersLeaversVacanciesDirective {
  public heading = 'How many new starters have you had for each job role in the last 12 months?';
  public section = 'Vacancies and turnover';
  public instruction = 'Only add the number of new starters who are in permanent and temporary job roles.';
  public revealTextContent =
    "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";
  public jobRoleType = 'new starters';

  protected selectedJobRoles: Array<Starter> = [];

  public loadSelectedJobRoles(): void {
    try {
      const loadedJobRoles = JSON.parse(localStorage.getItem('startersJobRoles'));
      this.selectedJobRoles = loadedJobRoles?.starters;
    } catch (err) {
      this.returnToFirstPage();
    }

    if (!Array.isArray(this.selectedJobRoles) || this.selectedJobRoles?.length === 0) {
      this.returnToFirstPage();
    }
  }

  protected clearLocalStorageData(): void {
    localStorage.removeItem('hasStarters');
    localStorage.removeItem('startersJobRoles');
  }

  protected returnToFirstPage(): void {
    this.router.navigate(['/workplace', `${this.establishment.uid}`, 'do-you-have-starters']);
  }

  protected setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'select-starter-job-roles'];
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const updatedStarters = this.selectedJobRoles.map((job, index) => {
      const fieldsToUpdate: Starter = {
        jobId: Number(job.jobId),
        total: parseInt(this.jobRoleNumbers.value[index]),
      };
      if (job.other) {
        fieldsToUpdate.other = job.other;
      }
      return fieldsToUpdate;
    });

    return { starters: updatedStarters };
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'do-you-have-leavers'];
  }
}
