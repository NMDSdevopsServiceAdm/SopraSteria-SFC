import { Component, OnInit } from '@angular/core';
import { DoYouHaveStartersLeaversVacanciesDirective } from '@shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-do-you-have-starters',
  templateUrl:
    '../../../shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.component.html',
})
export class DoYouHaveStartersComponent extends DoYouHaveStartersLeaversVacanciesDirective implements OnInit {
  protected setupRoutes(): void {
    this.previousRoute = ['/workplace', this.establishment?.uid, 'how-many-vacancies'];
    this.skipRoute = ['/workplace', `${this.establishment?.uid}`, 'leavers'];
    this.startersLeaversOrVacanciesPageTwo = 'select-starter-job-roles';
  }

  protected setPageVariables(): void {
    this.heading = 'Have you had any new starters in the last 12 months?';
    this.hintText = 'We only want to know about new starters who are in permanent and temporary job roles.';
    this.revealText =
      "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";
    this.localStorageKey = 'hasStarters';
    this.valueToUpdate = 'starters';
  }

  protected getDataFromEstablishment(): any {
    return this.establishment?.starters;
  }
}
