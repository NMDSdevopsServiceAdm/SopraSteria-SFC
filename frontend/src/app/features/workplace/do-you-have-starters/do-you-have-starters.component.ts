import { Component } from '@angular/core';
import { DoYouHaveStartersLeaversVacanciesDirective } from '@shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-do-you-have-starters',
  templateUrl:
    '../../../shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.component.html',
})
export class DoYouHaveStartersComponent extends DoYouHaveStartersLeaversVacanciesDirective {
  public heading = 'Have you had any new starters in the last 12 months?';
  public hintText = 'We only want to know about new starters who are in permanent and temporary job roles.';
  public localStorageKey = 'hasStarters';
  public valueToUpdate = 'starters';
  public revealText =
    "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";
  public requiredWarningMessage = "Select yes if you've had any new starters in the last 12 months";

  protected setupRoutes(): void {
    this.skipRoute = ['/workplace', `${this.establishment?.uid}`, 'do-you-have-leavers'];
    this.startersLeaversOrVacanciesPageTwo = 'select-starter-job-roles';
    this.previousRoute = this.getPreviousRoute('vacancies');
  }

  protected getDataFromEstablishment(): any {
    return this.establishment?.starters;
  }
}
