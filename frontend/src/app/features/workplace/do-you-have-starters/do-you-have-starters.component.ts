import { Component, OnInit } from '@angular/core';
import { DoYouHaveStartersVacanciesLeaversDirective } from '@shared/directives/do-you-have-starters-vacancies-leavers/do-you-have-starters-vacancies-leavers.directive';

@Component({
  selector: 'app-do-you-have-starters',
  templateUrl:
    '../../shared/directives/do-you-have-starters-vacancies-leavers/do-you-have-starters-vacancies-leavers.html',
})
export class DoYouHaveStartersComponent extends DoYouHaveStartersVacanciesLeaversDirective implements OnInit {
  ngOnInit(): void {}
}
