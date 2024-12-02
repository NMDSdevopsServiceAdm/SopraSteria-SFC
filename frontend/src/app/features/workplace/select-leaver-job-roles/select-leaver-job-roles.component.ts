import { Component } from '@angular/core';
import { Leaver } from '@core/model/establishment.model';

import { SelectJobRolesDirective } from '../vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-leaver-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectLeaverJobRolesComponent extends SelectJobRolesDirective {
  public errorMessageOnEmptyInput = 'Select job roles of all your staff leavers';
  public heading = 'Select job roles of all your staff leavers';
  protected localStorageKey = 'leaversJobRoles';
  protected prefillData: Leaver[] = [];
  protected field = 'leavers';

  protected onSuccess(): void {
    const selectedJobIds: number[] = this.form.get('selectedJobRoles').value;
    const otherCareProvidingRoleName: string = this.form.get('otherCareProvidingRoleName').value;
    const leaversFromDatabase = Array.isArray(this.establishment.leavers) ? this.establishment.leavers : [];

    const updatedLeavers: Leaver[] = selectedJobIds.map((jobId) => {
      const job = this.jobsAvailable.find((job) => job.id === jobId);
      const leaverCount = leaversFromDatabase.find((leaver) => leaver.jobId === jobId)?.total ?? null;
      if (job.id === this.jobIdOfOtherCareProvidingRole && otherCareProvidingRoleName) {
        return { jobId, title: job.title, total: leaverCount, other: otherCareProvidingRoleName };
      }

      return { jobId, title: job.title, total: leaverCount };
    });
    const dataToStore = { establishmentUid: this.establishment.uid, leavers: updatedLeavers };
    this.saveToLocal(dataToStore);
  }
}
