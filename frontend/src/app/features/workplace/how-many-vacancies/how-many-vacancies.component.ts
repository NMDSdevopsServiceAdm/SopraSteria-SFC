import { Component, OnDestroy, OnInit } from '@angular/core';
import { Question } from '../question/question.component';

@Component({
  selector: 'app-how-many-vacancies',
  templateUrl: './how-many-vacancies.component.html',
})
export class HowManyVacanciesComponent extends Question implements OnInit, OnDestroy {
  // public errorMessageOnEmptyInput = 'Select job roles for all your current staff vacancies';
  public heading = 'How many current staff vacancies do you have for each job role?';
  public section = 'Vacancies and turnover';
}
