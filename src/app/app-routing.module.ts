import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import {
  ProblemWithTheServiceComponent,
} from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { LoggedOutGuard } from '@core/guards/logged-out/logged-out.guard';
import { MigratedUserGuard } from '@core/guards/migrated-user/migrated-user.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { RoleGuard } from '@core/guards/role/role.guard';
import { Roles } from '@core/model/roles.enum';
import { LoggedInUserResolver } from '@core/resolvers/logged-in-user.resolver';
import { PrimaryWorkplaceResolver } from '@core/resolvers/primary-workplace.resolver';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import {
  MigratedUserTermsConditionsComponent,
} from '@features/migrated-user-terms-conditions/migrated-user-terms-conditions.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'logged-out',
    component: LogoutComponent,
    data: { title: 'Logged Out' },
  },
  {
    path: 'problem-with-the-service',
    component: ProblemWithTheServiceComponent,
    data: { title: 'Problem with the Service' },
  },
  {
    path: '',
    loadChildren: '@features/public/public.module#PublicModule',
  },
  {
    path: '',
    canActivateChild: [LoggedOutGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login' },
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
        path: 'forgot-your-password',
        component: ForgotYourPasswordComponent,
        data: { title: 'Forgotten Password' },
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        data: { title: 'Reset Password' },
      },
    ],
  },
  {
    path: '',
    canActivate: [HasPermissionsGuard],
    canActivateChild: [AuthGuard],
    resolve: {
      loggedInUser: LoggedInUserResolver,
      primaryWorkplace: PrimaryWorkplaceResolver,
    },
    children: [
      {
        path: 'migrated-user-terms-and-conditions',
        canActivate: [MigratedUserGuard],
        component: MigratedUserTermsConditionsComponent,
        data: { title: 'Migrated User Terms And Conditions' },
      },
      {
        path: 'workplace',
        loadChildren: '@features/workplace/workplace.module#WorkplaceModule',
        data: { title: 'Workplace' },
      },
      {
        path: 'add-workplace',
        loadChildren: '@features/add-workplace/add-workplace.module#AddWorkplaceModule',
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canAddEstablishment'],
          title: 'Add Workplace',
        },
      },
      {
        path: 'account-management',
        loadChildren: '@features/account-management/account-management.module#AccountManagementModule',
        data: { title: 'Account details' },
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'bulk-upload',
        loadChildren: '@features/bulk-upload/bulk-upload.module#BulkUploadModule',
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canBulkUpload'],
          title: 'Bulk Upload',
        },
      },
      {
        path: 'search-users',
        loadChildren: '@features/search/search.module#SearchModule',
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Search Users',
        },
      },
      {
        path: 'search-establishments',
        loadChildren: '@features/search/search.module#SearchModule',
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Search Establishments',
        },
      },
    ],
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
