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
import { ChangeYourDetailsComponent } from './features/change-your-details/change-your-details.component';
import { ChangeUserSecurityComponent } from './features/change-user-security/change-user-security.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { YourAccountComponent } from './features/your-account/your-account.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login' },
  },
  {
    path: 'logged-out',
    component: LogoutComponent,
    data: { title: 'Logged Out' },
  },
  {
    path: 'forgot-your-password',
    component: ForgotYourPasswordComponent,
    data: { title: 'Forgotten Password' },
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: { title: 'Reset Password' },
  },
  {
    path: 'your-account',
    component: YourAccountComponent,
    canActivate: [AuthGuard],
    data: { title: 'Your Account' },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Password' },
  },
  {
    path: 'change-your-details',
    component: ChangeYourDetailsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Your Details' },
  },
  {
    path: 'change-user-security',
    component: ChangeUserSecurityComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Security Question' },
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
    data: { title: 'Give us Feedback' },
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
    data: { title: 'Contact Us' },
  },
  {
    path: 'terms-and-conditions',
    component: TermsConditionsComponent,
    data: { title: 'Terms and Conditions' },
  },
  {
    path: 'problem-with-the-service',
    component: ProblemWithTheServiceComponent,
    data: { title: 'Problem with the Service' },
  },
  {
    path: 'workplace',
    loadChildren: '@features/workplace/workplace.module#WorkplaceModule',
    canActivate: [AuthGuard],
    data: { title: 'Workplace' },
  },
  {
    path: 'worker',
    loadChildren: '@features/workers/workers.module#WorkersModule',
    canActivate: [AuthGuard],
    data: { title: 'Staff Records' },
  },
  {
    path: 'registration',
    loadChildren: '@features/registration/registration.module#RegistrationModule',
    data: { title: 'Registration' },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' },
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
