import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  VacanciesComponent,
} from './vacancies.component';

import { VacanciesRoutingModule } from './vacancies-routing.module';

@NgModule({
  imports: [
    VacanciesRoutingModule
  ],
  declarations: [
    VacanciesComponent
  ],
  providers: [

  ]
})
export class RegisterModule { }
