import { Component } from '@angular/core';
import { DoYouHaveStartersLeaversVacanciesDirective } from '@shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-do-you-have-leavers',
  templateUrl:
    '../../../shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.component.html',
})
export class DoYouHaveLeaversComponent extends DoYouHaveStartersLeaversVacanciesDirective {
  public heading = 'Have you had any staff leave in the last 12 months?';
  public hintText = 'We only want to know about leavers who have left permanent and temporary job roles.';
  public revealText =
    'To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions.';
  public hasStartersLeaversVacanciesField = 'hasLeavers';
  public numbersField = 'leaversJobRoles';
  public valueToUpdate = 'leavers';
  public requiredWarningMessage = "Select yes if you've had any staff leave in the last 12 months";

  protected setupRoutes(): void {
    this.skipRoute = ['/workplace', `${this.establishment?.uid}`, 'recruitment-advertising-cost'];
    this.startersLeaversOrVacanciesPageTwo = 'select-leaver-job-roles';
    this.previousRoute = this.getPreviousRoute('starters');
  }
}
