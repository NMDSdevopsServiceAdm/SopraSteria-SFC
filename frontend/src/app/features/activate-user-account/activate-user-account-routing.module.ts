import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivationCompleteWithOutChildGuard } from '@core/guards/activation-complete/activation-complete-without-child.guard';
import { ActivationCompleteGuard } from '@core/guards/activation-complete/activation-complete.guard';
import { CreateUserGuard } from '@core/guards/create-user/create-user.guard';
import { ActivationCompleteComponent } from '@features/activate-user-account/activation-complete/activation-complete.component';
import { ChangeYourDetailsComponent } from '@features/activate-user-account/change-your-details/change-your-details.component';
import { ConfirmAccountDetailsComponent } from '@features/activate-user-account/confirm-account-details/confirm-account-details.component';
import { CreateUsernameComponent } from '@features/activate-user-account/create-username/create-username.component';
import { ExpiredActivationLinkComponent } from '@features/activate-user-account/expired-activation-link/expired-activation-link.component';
import { SecurityQuestionComponent } from '@features/activate-user-account/security-question/security-question.component';

const routes: Routes = [
  {
    path: 'expired-activation-link',
    component: ExpiredActivationLinkComponent,
    data: { title: 'Activation Link Expired' },
  },
  {
    path: ':activationToken',
    canActivate: [CreateUserGuard],

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
        canActivate: [ActivationCompleteWithOutChildGuard],
        data: { title: 'Security Question' },
      },

      {
        path: 'confirm-account-details',
        canActivateChild: [ActivationCompleteGuard],
        children: [
          {
            path: '',
            component: ConfirmAccountDetailsComponent,
            data: { title: 'Confirm Account Details' },
          },
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
        ],
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
