import { Component, OnInit } from '@angular/core';
import { DoYouHaveStartersLeaversVacanciesDirective } from '@shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-do-you-have-vacancies',
  templateUrl:
    '../../../shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.component.html',
})
export class DoYouHaveVacanciesComponent extends DoYouHaveStartersLeaversVacanciesDirective implements OnInit {
  public heading = 'Do you have any current staff vacancies?';
  public hintText = 'We only want to know about current staff vacancies for permanent and temporary job roles.';
  public localStorageKey = 'hasVacancies';
  public valueToUpdate = 'vacancies';
  public revealText =
    'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';

  protected setupRoutes(): void {
    this.previousRoute = ['/workplace', this.establishment?.uid, 'service-users'];
    this.skipRoute = ['/workplace', `${this.establishment?.uid}`, 'do-you-have-starters'];
    this.startersLeaversOrVacanciesPageTwo = 'select-vacancy-job-roles';
  }

  protected getDataFromEstablishment(): any {
    return this.establishment?.vacancies;
  }
}
