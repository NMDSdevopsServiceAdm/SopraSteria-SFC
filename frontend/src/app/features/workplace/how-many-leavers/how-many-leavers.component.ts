import { Component } from '@angular/core';
import { Leaver, UpdateJobsRequest } from '@core/model/establishment.model';

import { HowManyStartersLeaversVacanciesDirective } from '../vacancies-and-turnover/how-many-starters-leavers-vacancies.directive';
import { DateUtil } from '@core/utils/date-util';

@Component({
  selector: 'app-how-many-leavers',
  templateUrl: '../vacancies-and-turnover/how-many-starters-leavers-vacancies.html',
  styleUrls: ['../vacancies-and-turnover/how-many-starters-leavers-vacancies.scss'],
  standalone: false,
})
export class HowManyLeaversComponent extends HowManyStartersLeaversVacanciesDirective {
  public heading = `How many leavers have you had SINCE ${DateUtil.getDateForOneYearAgo()}?`;
  public instruction = 'Only add the number of leavers who left permanent and temporary job roles.';
  public revealTextContent =
    'To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions.';
  public jobRoleType = 'leavers';
  public fieldName = 'leavers';
  public fieldJobRoles = 'leaversJobRoles';
  public jobRolesTableTitle = 'Leavers in the last 12 months';
  public totalNumberDescription = 'Total number of leavers';

  protected selectedJobRoles: Array<Leaver> = [];

  protected clearLocalStorageData(): void {
    localStorage.removeItem('hasLeavers');
    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
  }

  protected getSelectedJobRoleFromService(): Leaver[] {
    return this.vacanciesAndTurnoverService.selectedLeavers;
  }

  protected saveSelectedJobRolesToService(): void {
    this.vacanciesAndTurnoverService.selectedLeavers = this.jobRoleNumbersTable.currentValues;
  }

  protected returnToFirstPage(): void {
    this.navigateToQuestionPage('do-you-have-leavers');
  }

  protected returnToJobRoleSelectionPage(): void {
    this.navigateToQuestionPage('select-leaver-job-roles');
  }

  protected setPreviousRoute(): void {
    this.previousQuestionPage = 'select-leaver-job-roles';
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    const updatedLeavers = this.selectedJobRoles.map((job, index) => {
      const fieldsToUpdate: Leaver = {
        jobId: Number(job.jobId),
        total: parseInt(this.jobRoleNumbers.value[index]),
      };
      return fieldsToUpdate;
    });

    return { leavers: updatedLeavers };
  }

  protected onSuccess(): void {
    this.nextQuestionPage = 'staff-recruitment-capture-training-requirement';
  }
}
