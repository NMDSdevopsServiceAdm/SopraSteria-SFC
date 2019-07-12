import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAccountComponent } from '@features/create-account/create-account/create-account.component';
import { CreateUsernameComponent } from '@features/create-account/create-username/create-username.component';
import { SecurityQuestionComponent } from '@features/create-account/security-question/security-question.component';

const routes: Routes = [
  {
    path: '',
    component: CreateAccountComponent,
  },
  {
    path: 'create-username',
    component: CreateUsernameComponent,
    data: { title: 'Create Username' },
  },
  {
    path: 'security-question',
    component: SecurityQuestionComponent,
    data: { title: 'Security Question' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateAccountRoutingModule {}
