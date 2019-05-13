import { AuthGuard } from '@core/services/auth-guard.service';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import { ProblemWithTheServiceComponent } from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { ReportsComponent } from '@features/reports/reports.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';
import { RouterModule, Routes } from '@angular/router';

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
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuard],
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
    path: 'public',
    loadChildren: '@features/public/public.module#PublicModule',
    data: { title: 'Public' },
  },
  {
    path: 'account-management',
    loadChildren: '@features/account-management/account-management.module#AccountManagementModule',
    canActivate: [AuthGuard],
    data: { title: 'Account Management' },
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
