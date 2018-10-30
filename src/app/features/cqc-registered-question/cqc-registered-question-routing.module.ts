import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CqcRegisteredQuestionComponent } from './cqc-registered-question.component';

const routes: Routes = [
  {
    path: 'default',
    component: CqcRegisteredQuestionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CqcRegisteredQuestionRoutingModule { }
