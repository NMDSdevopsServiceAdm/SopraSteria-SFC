import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import { ProblemWithTheServiceComponent } from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { LoggedOutGuard } from '@core/guards/logged-out/logged-out.guard';
import { MigratedUserGuard } from '@core/guards/migrated-user/migrated-user.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { RoleGuard } from '@core/guards/role/role.guard';
import { Roles } from '@core/model/roles.enum';
import { LoggedInUserResolver } from '@core/resolvers/logged-in-user.resolver';
import { NotificationsListResolver } from '@core/resolvers/notifications-list.resolver';
import { PrimaryWorkplaceResolver } from '@core/resolvers/primary-workplace.resolver';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { MigratedUserTermsConditionsComponent } from '@features/migrated-user-terms-conditions/migrated-user-terms-conditions.component';
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
    loadChildren: () => import('@features/public/public.module').then((m) => m.PublicModule),
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
        loadChildren: () => import('@features/registration/registration.module').then((m) => m.RegistrationModule),
        data: { title: 'Registration' },
      },
      {
        path: 'activate-account',
        loadChildren: () =>
          import('@features/activate-user-account/activate-user-account.module').then(
            (m) => m.ActivateUserAccountModule,
          ),
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
      notifications: NotificationsListResolver,
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
        loadChildren: () => import('@features/workplace/workplace.module').then((m) => m.WorkplaceModule),
        data: { title: 'Workplace' },
      },
      {
        path: 'reports',
        loadChildren: () => import('@features/reports/reports.module').then((m) => m.ReportsModule),
        data: { title: 'Reports' },
      },
      {
        path: 'add-workplace',
        loadChildren: () => import('@features/add-workplace/add-workplace.module').then((m) => m.AddWorkplaceModule),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canAddEstablishment'],
          title: 'Add Workplace',
        },
      },
      {
        path: 'account-management',
        loadChildren: () =>
          import('@features/account-management/account-management.module').then((m) => m.AccountManagementModule),
        data: { title: 'Account details' },
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'bulk-upload',
        loadChildren: () => import('@features/bulk-upload/bulk-upload.module').then((m) => m.BulkUploadModule),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canBulkUpload'],
          title: 'Bulk Upload',
        },
      },
      {
        path: 'search-users',
        loadChildren: () => import('@features/search/search.module').then((m) => m.SearchModule),
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Search Users',
        },
      },
      {
        path: 'search-establishments',
        loadChildren: () => import('@features/search/search.module').then((m) => m.SearchModule),
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Search Establishments',
        },
      },
      {
        path: 'search-groups',
        loadChildren: () => import('@features/search/search.module').then((m) => m.SearchModule),
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Search Groups',
        },
      },
      {
        path: 'registrations',
        loadChildren: () => import('@features/search/search.module').then((m) => m.SearchModule),
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Registrations',
        },
      },
      {
        path: 'parent-requests',
        loadChildren: () => import('@features/search/search.module').then((m) => m.SearchModule),
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Parent Requests',
        },
      },
      {
        path: 'cqc-status-changes',
        loadChildren: () => import('@features/search/search.module').then((m) => m.SearchModule),
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'CQC Status Change',
        },
      },
      {
        path: 'notifications',
        loadChildren: () => import('@features/notifications/notifications.module').then((m) => m.NotificationsModule),
      },
      {
        path: 'add-mandatory-training',
        loadChildren: () =>
          import('@features/add-mandatory-training/add-mandatory-training.module').then(
            (m) => m.AddMandatoryTrainingModule,
          ),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canAddEstablishment'],
          title: 'Add Mandatory Training',
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
