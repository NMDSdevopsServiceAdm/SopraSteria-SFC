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
  public localStorageKey = 'hasLeavers';
  public valueToUpdate = 'leavers';

  protected setupRoutes(): void {
    this.previousRoute = ['/workplace', this.establishment?.uid, 'how-many-starters'];
    this.skipRoute = ['/workplace', `${this.establishment?.uid}`, 'recruitment-advertising-cost'];
    this.startersLeaversOrVacanciesPageTwo = 'select-leaver-job-roles';
  }

  protected getDataFromEstablishment(): any {
    return this.establishment?.leavers;
  }
}
