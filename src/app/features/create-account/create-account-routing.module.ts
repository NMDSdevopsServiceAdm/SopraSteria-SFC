import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSavedComponent } from '@features/create-account/account-saved/account-saved.component';
import {
  ConfirmAccountDetailsComponent,
} from '@features/create-account/confirm-account-details/confirm-account-details.component';
import { CreateAccountComponent } from '@features/create-account/create-account/create-account.component';
import { CreateUsernameComponent } from '@features/create-account/create-username/create-username.component';
import { SecurityQuestionComponent } from '@features/create-account/security-question/security-question.component';

const routes: Routes = [
  {
    path: '',
  },
  {
    path: ':establishmentUid/create-user',
    component: CreateAccountComponent,
    data: { title: 'Create User' },
  },
  {
    path: 'create-username',
    component: CreateUsernameComponent,
    data: { title: 'Create Username' },
  },
  {
    path: 'saved',
    component: AccountSavedComponent,
    data: { title: 'Account saved' },
  },
  {
    path: 'security-question',
    component: SecurityQuestionComponent,
    data: { title: 'Security Question' },
  },
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent,
    data: { title: 'Confirm Account Details' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateAccountRoutingModule {}
