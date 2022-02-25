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
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { TotalStaffRecordsResolver } from '@core/resolvers/dashboard/total-staff-records.resolver';
import { LoggedInUserResolver } from '@core/resolvers/logged-in-user.resolver';
import { NotificationsListResolver } from '@core/resolvers/notifications-list.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';
import { PrimaryWorkplaceResolver } from '@core/resolvers/primary-workplace.resolver';
import { WizardResolver } from '@core/resolvers/wizard/wizard.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { AdminComponent } from '@features/admin/admin.component';
import { BenefitsBundleComponent } from '@features/benefits-bundle/benefits-bundle.component';
import { BenefitsELearningComponent } from '@features/benefits-bundle/benefits-elearning/benefits-elearning.component';
import { BenefitsTrainingDiscountsComponent } from '@features/benefits-bundle/benefits-training-discounts/benefits-training-discounts.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { FirstLoginPageComponent } from '@features/first-login-page/first-login-page.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { MigratedUserTermsConditionsComponent } from '@features/migrated-user-terms-conditions/migrated-user-terms-conditions.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';
import { SatisfactionSurveyComponent } from '@features/satisfaction-survey/satisfaction-survey.component';

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
      {
        path: 'satisfaction-survey',
        component: SatisfactionSurveyComponent,
        data: { title: 'Satisfaction Survey' },
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
        resolve: {
          articleList: ArticleListResolver,
          users: AllUsersForEstablishmentResolver,
          workers: WorkersResolver,
          totalStaffRecords: TotalStaffRecordsResolver,
        },
        data: { title: 'Dashboard' },
      },
      {
        path: 'first-login-wizard',
        component: FirstLoginPageComponent,
        resolve: {
          wizard: WizardResolver,
        },
        data: { title: 'First Login Wizard' },
      },
      {
        path: 'bulk-upload',
        loadChildren: () => import('@features/bulk-upload/bulk-upload.module').then((m) => m.BulkUploadModule),
        data: { title: 'Bulk Upload' },
      },
      {
        path: 'sfcadmin',
        loadChildren: () => import('@features/admin/admin.module').then((m) => m.AdminModule),
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin],
          title: 'Admin',
        },
        component: AdminComponent,
      },
      {
        path: 'wdf',
        loadChildren: () => import('@features/wdf/wdf-data-change/wdf.module').then((m) => m.WdfModule),
        data: { title: 'Workforce Development Fund Data' },
      },
      {
        path: 'wdf-claims',
        loadChildren: () => import('@features/wdf/wdf-claims/wdf-claims.module').then((m) => m.WdfClaimsModule),
        data: { title: 'Workforce Development Fund Claims' },
      },
      {
        path: 'notifications',
        loadChildren: () => import('@features/notifications/notifications.module').then((m) => m.NotificationsModule),
      },
      {
        path: 'registration-survey',
        loadChildren: () =>
          import('@features/registration-survey/registration-survey.module').then((m) => m.RegistrationSurveyModule),
      },
      {
        path: 'articles',
        loadChildren: () => import('@features/articles/articles.module').then((m) => m.ArticlesModule),
      },
      {
        path: '',
        loadChildren: () => import('@features/pages/pages.module').then((m) => m.PagesModule),
      },
      {
        path: 'benefits-bundle',
        children: [
          {
            path: '',
            component: BenefitsBundleComponent,
            data: { title: 'Benefits Bundle' },
          },
          {
            path: 'training-discounts',
            component: BenefitsTrainingDiscountsComponent,
            data: { title: 'Endorsed Training Providers Discounts' },
            resolve: {
              pages: PageResolver,
            },
          },
          {
            path: 'elearning-discounts',
            component: BenefitsELearningComponent,
            data: { title: 'eLearning Modules' },
            resolve: {
              pages: PageResolver,
            },
          },
        ],
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
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
