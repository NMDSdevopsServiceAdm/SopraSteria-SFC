import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VacanciesComponent } from './vacancies.component';

const routes: Routes = [
  {
    path: 'default',
    component:  VacanciesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VacanciesRoutingModule { }
