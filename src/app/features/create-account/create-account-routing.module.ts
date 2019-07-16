import { AccountSavedComponent } from '@features/create-account/account-saved/account-saved.component';
import { ConfirmAccountDetailsComponent } from '@features/create-account/confirm-account-details/confirm-account-details.component';
import { CreateUserAccountComponent } from '@features/create-account/create-user-account/create-user-account.component';
import { CreateUsernameComponent } from '@features/create-account/create-username/create-username.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityQuestionComponent } from '@features/create-account/security-question/security-question.component';

const routes: Routes = [
  {
    path: '',
    component: CreateUserAccountComponent,
  },
  {
    path: 'create-username/:establishmentUid',
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
