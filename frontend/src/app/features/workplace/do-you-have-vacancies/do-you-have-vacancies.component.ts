import { Component, OnInit } from '@angular/core';
import { DoYouHaveStartersLeaversVacanciesDirective } from '@shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-do-you-have-vacancies',
  templateUrl:
    '../../../shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.component.html',
})
export class DoYouHaveVacanciesComponent extends DoYouHaveStartersLeaversVacanciesDirective implements OnInit {
  protected setupRoutes(): void {
    this.previousRoute = ['/workplace', this.establishment?.uid, 'service-users'];
    this.skipRoute = ['/workplace', `${this.establishment?.uid}`, 'do-you-have-starters'];
    this.startersLeaversOrVacanciesPageTwo = 'select-vacancy-job-roles';
  }

  protected setPageVariables(): void {
    this.heading = 'Do you have any current staff vacancies?';
    this.hintText = 'We only want to know about current staff vacancies for permanent and temporary job roles.';
    this.revealText =
      'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
    this.localStorageKey = 'hasVacancies';
    this.valueToUpdate = 'vacancies';
  }

  protected getDataToPrefill(): void {
    this.dataToPrefill = this.establishment?.vacancies;
  }
}
