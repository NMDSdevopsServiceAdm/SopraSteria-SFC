import { Component } from '@angular/core';
import { Starter, UpdateJobsRequest } from '@core/model/establishment.model';

import { HowManyStartersLeaversVacanciesDirective } from '../vacancies-and-turnover/how-many-starters-leavers-vacancies.directive';
import { DateUtil } from '@core/utils/date-util';

@Component({
  selector: 'app-how-many-starters',
  templateUrl: '../vacancies-and-turnover/how-many-starters-leavers-vacancies.html',
  styleUrls: ['../vacancies-and-turnover/how-many-starters-leavers-vacancies.scss'],
})
export class HowManyStartersComponent extends HowManyStartersLeaversVacanciesDirective {
  public heading = `How many starters have you had SINCE ${DateUtil.getDateForOneYearAgo()}?`;
  public instruction = 'Only add the number of starters in permanent and temporary job roles.';
  public revealTextContent =
    "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";
  public jobRoleType = 'starters';
  public fieldName = 'starters';
  public fieldJobRoles = 'startersJobRoles';
  public jobRolesTableTitle = 'Starters in the last 12 months';
  public totalNumberDescription = 'Total number of starters';

  protected selectedJobRoles: Array<Starter> = [];

  protected clearLocalStorageData(): void {
    localStorage.removeItem('hasStarters');
    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
  }

  protected getSelectedJobRoleFromService(): Starter[] {
    return this.vacanciesAndTurnoverService.selectedStarters;
  }

  protected saveSelectedJobRolesToService(): void {
    this.vacanciesAndTurnoverService.selectedStarters = this.jobRoleNumbersTable.currentValues;
  }

  protected returnToFirstPage(): void {
    this.router.navigate(['/workplace', this.establishment.uid, 'do-you-have-starters']);
  }

  protected returnToJobRoleSelectionPage(): void {
    this.router.navigate(['/workplace', this.establishment.uid, 'select-starter-job-roles']);
  }

  protected setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'select-starter-job-roles'];
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const updatedStarters = this.selectedJobRoles.map((job, index) => {
      const fieldsToUpdate: Starter = {
        jobId: Number(job.jobId),
        total: parseInt(this.jobRoleNumbers.value[index]),
      };
      return fieldsToUpdate;
    });

    return { starters: updatedStarters };
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', this.establishment.uid, 'do-you-have-leavers'];
  }
}
