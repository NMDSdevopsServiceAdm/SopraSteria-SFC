import { Component, OnDestroy, OnInit } from '@angular/core';
import { Vacancy } from '@core/model/establishment.model';
import { SelectJobRolesDirective } from '../vacancies-and-turnover/select-job-roles.directive';

@Component({
  selector: 'app-select-vacancy-job-roles',
  templateUrl: '../vacancies-and-turnover/select-job-roles.html',
})
export class SelectVacancyJobRolesComponent extends SelectJobRolesDirective implements OnInit, OnDestroy {
  public errorMessageOnEmptyInput = 'Select job roles for all your current staff vacancies';
  public heading = 'Select job roles for all your current staff vacancies';
  protected localStorageKey = 'updated-vacancies';
  protected prefillData: Vacancy[] = [];

  protected setupRoutes(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'how-many-vacancies'];
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'do-you-have-vacancies'];
  }

  protected getPrefillData() {
    const previousData = this.loadFromLocal();
    if (previousData?.establishmentUid === this.establishment.uid && Array.isArray(previousData?.vacancies)) {
      this.prefillData = previousData.vacancies;
    } else if (Array.isArray(this.establishment.vacancies)) {
      this.prefillData = this.establishment.vacancies;
    }
  }

  protected onSuccess(): void {
    const selectedJobIds: number[] = this.form.get('selectedJobRoles').value;
    const otherCareProvidingRoleName: string = this.form.get('otherCareProvidingRoleName').value;

    const updatedVacancies: Vacancy[] = selectedJobIds.map((jobId) => {
      const job = this.jobsAvailable.find((job) => job.id === jobId);
      const vacancyCount = this.prefillData.find((vacancy) => vacancy.jobId === jobId)?.total ?? null;
      if (job.id === this.jobIdOfOtherCareProvidingRole && otherCareProvidingRoleName) {
        return { jobId, title: job.title, total: vacancyCount, other: otherCareProvidingRoleName };
      }

      return { jobId, title: job.title, total: vacancyCount };
    });
    const dataToStore = { establishmentUid: this.establishment.uid, vacancies: updatedVacancies };
    this.saveToLocal(dataToStore);
  }
}
