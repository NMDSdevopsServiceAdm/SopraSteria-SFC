import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateUserGuard } from '@core/guards/create-user/create-user.guard';
import { ActivationCompleteComponent } from '@features/activate-user-account/activation-complete/activation-complete.component';
import { ConfirmAccountDetailsComponent } from '@features/activate-user-account/confirm-account-details/confirm-account-details.component';
import { CreateUsernameComponent } from '@features/activate-user-account/create-username/create-username.component';
import { SecurityQuestionComponent } from '@features/activate-user-account/security-question/security-question.component';
import { ExpiredActivationLinkComponent } from '@features/activate-user-account/expired-activation-link/expired-activation-link.component';
import { ActivationCompleteGuard } from '@core/guards/activation-complete/activation-complete.guard';
import { ChangeYourDetailsComponent } from '@features/activate-user-account/change-your-details/change-your-details.component';

const routes: Routes = [
  {
    path: 'expired-activation-link',
    component: ExpiredActivationLinkComponent,
    data: { title: 'Activation Link Expired' },
  },
  {
    path: ':activationToken',
    canActivate: [CreateUserGuard],
    canActivateChild: [ActivationCompleteGuard],
    data: { title: 'Activate User Account' },
    children: [
      {
        path: 'change-your-details',
        component: ChangeYourDetailsComponent,
        data: { title: 'Change Your Details' },
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivateUserAccountRoutingModule {}
