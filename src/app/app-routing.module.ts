import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import {
  ProblemWithTheServiceComponent,
} from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { ContactUsComponent } from '@features/contact-us/contact-us.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { FeedbackComponent } from '@features/feedback/feedback.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { TermsConditionsComponent } from '@features/terms-conditions/terms-conditions.component';

import { AuthGuard } from './core/services/auth-guard.service';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { ChangeUserDetailsComponent } from './features/change-user-details/change-user-details.component';
import { ChangeUserSecurityComponent } from './features/change-user-security/change-user-security.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { YourAccountComponent } from './features/your-account/your-account.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'logged-out',
    component: LogoutComponent,
  },
  {
    path: 'forgot-your-password',
    component: ForgotYourPasswordComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'your-account',
    component: YourAccountComponent,
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
    component: ProblemWithTheServiceComponent,
  },
  {
    path: 'workplace',
    loadChildren: '@features/workplace/workplace.module#WorkplaceModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'worker',
    loadChildren: '@features/workers/workers.module#WorkersModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'registration',
    loadChildren: '@features/registration/registration.module#RegistrationModule',
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
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
