import { Component } from '@angular/core';
import { Leaver, UpdateJobsRequest } from '@core/model/establishment.model';

import { HowManyStartersLeaversVacanciesDirective } from '../vacancies-and-turnover/how-many-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-how-many-leavers',
  templateUrl: '../vacancies-and-turnover/how-many-starters-leavers-vacancies.html',
  styleUrls: ['../vacancies-and-turnover/how-many-starters-leavers-vacancies.scss'],
})
export class HowManyLeaversComponent extends HowManyStartersLeaversVacanciesDirective {
  public heading = 'How many leavers have you had for each job role in the last 12 months?';
  public instruction = 'Only add the number of leavers who have left permanent and temporary job roles.';
  public revealTextContent =
    'To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions.';
  public jobRoleType = 'leavers';
  public fieldName = 'leavers';
  public fieldJobRoles = 'leaversJobRoles';

  protected selectedJobRoles: Array<Leaver> = [];

  protected clearLocalStorageData(): void {
    localStorage.removeItem('hasLeavers');
    localStorage.removeItem('leaversJobRoles');
  }

  protected returnToFirstPage(): void {
    this.router.navigate(['/workplace', `${this.establishment.uid}`, 'do-you-have-leavers']);
  }

  protected setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'select-leaver-job-roles'];
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const updatedLeavers = this.selectedJobRoles.map((job, index) => {
      const fieldsToUpdate: Leaver = {
        jobId: Number(job.jobId),
        total: parseInt(this.jobRoleNumbers.value[index]),
      };
      if (job.other) {
        fieldsToUpdate.other = job.other;
      }
      return fieldsToUpdate;
    });

    return { leavers: updatedLeavers };
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', this.establishment.uid, 'recruitment-advertising-cost'];
  }
}
