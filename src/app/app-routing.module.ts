import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePasswordComponent } from '@features/change-password/change-password.component';
import { ChangeUserDetailsComponent } from '@features/change-user-details/change-user-details.component';
import { ChangeUserSecurityComponent } from '@features/change-user-security/change-user-security.component';
import { ChangeUserSummaryComponent } from '@features/change-user-summary/change-user-summary.component';
import { ConfirmAccountDetailsComponent } from '@features/confirm-account-details/confirm-account-details.component';
import { ConfirmWorkplaceDetailsComponent } from '@features/confirm-workplace-details/confirm-workplace-details.component';
import { ContactUsComponent } from '@features/contactUs/contactUs.component';
import { ContinueCreatingAccountComponent } from '@features/continue-creating-account/continue-creating-account.component';
import { CreateUsernameComponent } from '@features/create-username/create-username.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { EnterWorkplaceAddressComponent } from '@features/enter-workplace-address/enter-workplace-address.component';
import { FeedbackComponent } from '@features/feedback/feedback.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { RegistrationCompleteComponent } from '@features/registration-complete/registration-complete.component';
import { ReportsComponent } from '@features/reports/reports.component';
import { SecurityQuestionComponent } from '@features/security-question/security-question.component';
import { SelectMainServiceComponent } from '@features/select-main-service/select-main-service.component';
import { SelectWorkplaceAddressComponent } from '@features/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/select-workplace/select-workplace.component';
import { TermsConditionsComponent } from '@features/terms-conditions/terms-conditions.component';
import { UserDetailsComponent } from '@features/user-details/user-details.component';

import { PageNotFoundComponent } from './core/error/page-not-found/page-not-found.component';
import {
  ProblemWithTheServicePagesComponent,
} from './core/error/problem-with-the-service-pages/problem-with-the-service-pages.component';
import { RegisterGuard } from './core/guards/register/register.guard';
import { AuthGuard } from './core/services/auth-guard.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'logged-out',
    component: LogoutComponent,
  },
  // {
  //   path: 'forgot-your-password',
  //   component: ForgotYourPasswordComponent,
  // },
  // {
  //   path: 'reset-password',
  //   component: ResetPasswordComponent,
  // },
  {
    path: 'change-user-summary',
    component: ChangeUserSummaryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change-user-details',
    component: ChangeUserDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change-user-security',
    component: ChangeUserSecurityComponent,
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'registered-question',
  //   component: CqcRegisteredQuestionComponent,
  // },
  {
    path: 'select-workplace',
    component: SelectWorkplaceComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'confirm-workplace-details',
    component: ConfirmWorkplaceDetailsComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'user-details',
    component: UserDetailsComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'create-username',
    component: CreateUsernameComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'security-question',
    component: SecurityQuestionComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'registration-complete',
    component: RegistrationCompleteComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'select-workplace-address',
    component: SelectWorkplaceAddressComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'enter-workplace-address',
    component: EnterWorkplaceAddressComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'select-main-service',
    component: SelectMainServiceComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'continue-creating-account',
    component: ContinueCreatingAccountComponent,
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
  },
  {
    path: 'terms-and-conditions',
    component: TermsConditionsComponent,
  },
  {
    path: 'problem-with-the-service',
    component: ProblemWithTheServicePagesComponent,
  },
  {
    path: 'workplace',
    loadChildren: '@features/workplace/workplace.module#WorkplaceModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'worker',
    loadChildren: '@features/workers/workers.module#WorkersModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
