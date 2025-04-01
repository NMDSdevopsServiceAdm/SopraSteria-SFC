import { Component } from '@angular/core';
import {
  UpdateStartersLeaversVacanciesDirective,
} from '@shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.directive';

@Component({
  selector: 'app-update-vacancies',
  templateUrl:
    '../../../../shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.html',
  styleUrl:
    '../../../../shared/directives/update-starters-leavers-vacancies/update-starters-leavers-vacancies.component.scss',
})
export class UpdateVacanciesComponent extends UpdateStartersLeaversVacanciesDirective {}
