import { Component } from '@angular/core';
import { DoYouHaveStartersLeaversVacanciesDirective } from '@shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-do-you-have-leavers',
  templateUrl:
    '../../../shared/directives/do-you-have-starters-leavers-vacancies/do-you-have-starters-leavers-vacancies.component.html',
  standalone: false,
})
export class DoYouHaveLeaversComponent extends DoYouHaveStartersLeaversVacanciesDirective {
  public todayOneYearAgo = this.getDateForOneYearAgo();
  public heading = `Have you had any leavers SINCE ${this.todayOneYearAgo}?`;
  public hintText = 'We only want to know about leavers who were in permanent and temporary job roles.';
  public revealText =
    'To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions.';
  public hasStartersLeaversVacanciesField = 'hasLeavers';
  public numbersField = 'leaversJobRoles';
  public valueToUpdate = 'leavers';
  public requiredWarningMessage = `Select yes if you've had leavers since ${this.todayOneYearAgo}`;

  protected setupRoutes(): void {
    this.skipToQuestionPage = 'benefits-statutory-sick-pay';
    this.startersLeaversOrVacanciesPageTwo = 'select-leaver-job-roles';
    this.previousQuestionPage = this.getPreviousPage('starters');
  }
}
