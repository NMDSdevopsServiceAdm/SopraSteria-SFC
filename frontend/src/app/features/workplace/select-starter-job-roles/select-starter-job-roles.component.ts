import { Component } from '@angular/core';
import { Starter } from '@core/model/establishment.model';
import { SelectJobRolesDirective } from '@features/workplace/vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-starter-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectStarterJobRolesComponent extends SelectJobRolesDirective {
  public errorMessageOnEmptyInput = 'Select job roles for all your new starters';
  public heading = 'Select job roles for all your new starters';
  protected localStorageKey = 'startersJobRoles';
  protected prefillData: Starter[] = [];

  protected setupRoutes(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'how-many-starters'];
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'do-you-have-starters'];
  }

  protected getPrefillData() {
    const previousData = this.loadFromLocal();
    if (previousData?.establishmentUid === this.establishment.uid && Array.isArray(previousData?.starters)) {
      this.prefillData = previousData.starters;
    } else if (Array.isArray(this.establishment.starters)) {
      this.prefillData = this.establishment.starters;
    }
  }

  protected onSuccess(): void {
    const selectedJobIds: number[] = this.form.get('selectedJobRoles').value;
    const otherCareProvidingRoleName: string = this.form.get('otherCareProvidingRoleName').value;
    const startersFromDatabase = Array.isArray(this.establishment.starters) ? this.establishment.starters : [];

    const updatedStarters: Starter[] = selectedJobIds.map((jobId) => {
      const job = this.jobsAvailable.find((job) => job.id === jobId);
      const starterCount = startersFromDatabase.find((vacancy) => vacancy.jobId === jobId)?.total ?? null;
      if (job.id === this.jobIdOfOtherCareProvidingRole && otherCareProvidingRoleName) {
        return { jobId, title: job.title, total: starterCount, other: otherCareProvidingRoleName };
      }

      return { jobId, title: job.title, total: starterCount };
    });
    const dataToStore = { establishmentUid: this.establishment.uid, starters: updatedStarters };
    this.saveToLocal(dataToStore);
  }
}
