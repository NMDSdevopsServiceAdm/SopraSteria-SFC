import { ActivationCompleteComponent } from '@features/activate-user-account/activation-complete/activation-complete.component';
import { ConfirmAccountDetailsComponent } from '@features/activate-user-account/confirm-account-details/confirm-account-details.component';
import { CreateUsernameComponent } from '@features/activate-user-account/create-username/create-username.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityQuestionComponent } from '@features/activate-user-account/security-question/security-question.component';

const routes: Routes = [
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
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent,
    data: { title: 'Confirm Account Details' },
  },
  {
    path: 'complete',
    component: ActivationCompleteComponent,
    data: { title: 'Complete' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivateUserAccountRoutingModule {}
