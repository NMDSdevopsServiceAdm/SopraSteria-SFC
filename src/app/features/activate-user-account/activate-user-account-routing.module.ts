import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateUserGuard } from '@core/guards/create-user/create-user.guard';
import {
  ActivationCompleteComponent,
} from '@features/activate-user-account/activation-complete/activation-complete.component';
import {
  ConfirmAccountDetailsComponent,
} from '@features/activate-user-account/confirm-account-details/confirm-account-details.component';
import { CreateUsernameComponent } from '@features/activate-user-account/create-username/create-username.component';
import { SecurityQuestionComponent } from '@features/activate-user-account/security-question/security-question.component';
import { ExpiredActivationLinkComponent } from '@features/activate-user-account/expired-activation-link/expired-activation-link.component';
import { ActivationCompleteGuard } from '@core/guards/activation-complete/activation-complete.guard';

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
        path: 'create-username',
        canActivate: [ActivationCompleteGuard],
        component: CreateUsernameComponent,
        data: { title: 'Create Username' },
      },
      {
        path: 'security-question',
        canActivate: [ActivationCompleteGuard],
        component: SecurityQuestionComponent,
        data: { title: 'Security Question' },
      },
      {
        path: 'confirm-account-details',
        canActivate: [ActivationCompleteGuard],
        component: ConfirmAccountDetailsComponent,
        data: { title: 'Confirm Account Details' },
      },
      {
        path: 'complete',
        canActivate: [ActivationCompleteGuard],
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
