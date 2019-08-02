import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import {
  ProblemWithTheServiceComponent,
} from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { RoleGuard } from '@core/guards/role/role.guard';
import { Roles } from '@core/model/roles.enum';
import { LoggedInUserResolver } from '@core/resolvers/logged-in-user.resolver';
import { PrimaryWorkplaceResolver } from '@core/resolvers/primary-workplace.resolver';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';

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
    path: 'public',
    loadChildren: '@features/public/public.module#PublicModule',
  },
  {
    path: 'registration',
    loadChildren: '@features/registration/registration.module#RegistrationModule',
    data: { title: 'Registration' },
  },
  {
    path: 'activate-account',
    loadChildren: '@features/activate-user-account/activate-user-account.module#ActivateUserAccountModule',
    data: { title: 'Activate User Account' },
  },
  {
    path: '',
    resolve: { loggedInUser: LoggedInUserResolver, primaryWorkplace: PrimaryWorkplaceResolver },
    children: [
      {
        path: 'workplace',
        loadChildren: '@features/workplace/workplace.module#WorkplaceModule',
        canActivate: [AuthGuard],
        data: { title: 'Workplace' },
      },
      {
        path: 'add-workplace',
        loadChildren: '@features/add-workplace/add-workplace.module#AddWorkplaceModule',
        canActivate: [AuthGuard, ParentGuard],
        data: { title: 'Add Workplace' },
      },
      {
        path: 'account-management',
        loadChildren: '@features/account-management/account-management.module#AccountManagementModule',
        canActivate: [AuthGuard],
        data: { title: 'User Account' },
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { title: 'Dashboard' },
      },
      {
        path: 'bulk-upload',
        loadChildren: '@features/bulk-upload/bulk-upload.module#BulkUploadModule',
        canActivate: [AuthGuard, RoleGuard],
        data: {
          roles: [Roles.Edit, Roles.Admin],
          title: 'Bulk Upload',
        },
      },
      {
        path: 'search-users',
        loadChildren: '@features/search/search.module#SearchModule',
        canActivate: [AuthGuard, RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Search Users',
        },
      },
      {
        path: 'search-establishments',
        loadChildren: '@features/search/search.module#SearchModule',
        canActivate: [AuthGuard, RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Search Establishments',
        },
      },
    ],
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
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
