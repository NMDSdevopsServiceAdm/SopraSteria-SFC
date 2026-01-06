import { Component } from '@angular/core';
import { DoYouHaveStartersLeaversVacanciesDirective } from '@shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-do-you-have-vacancies',
  templateUrl:
    '../../../shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.component.html',
  standalone: false,
})
export class DoYouHaveVacanciesComponent extends DoYouHaveStartersLeaversVacanciesDirective {
  public heading = 'Do you have any current staff vacancies?';
  public hintText = 'We only want to know about current staff vacancies for permanent and temporary job roles.';
  public hasStartersLeaversVacanciesField = 'hasVacancies';
  public numbersField = 'vacanciesJobRoles';
  public valueToUpdate = 'vacancies';
  public revealText =
    'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
  public requiredWarningMessage = "Select yes if you've got current staff vacancies";

  protected setupRoutes(): void {
    this.setPreviousRoute();
    this.skipRoute = ['/workplace', `${this.establishment?.uid}`, 'do-you-have-starters'];
    this.startersLeaversOrVacanciesPageTwo = 'select-vacancy-job-roles';
  }

  private setPreviousRoute(): void {
    const previousPage = this.establishment.mainService.canDoDelegatedHealthcareActivities
      ? 'what-kind-of-delegated-healthcare-activities'
      : 'service-users';

    this.previousRoute = ['/workplace', this.establishment.uid, previousPage];
  }
}
