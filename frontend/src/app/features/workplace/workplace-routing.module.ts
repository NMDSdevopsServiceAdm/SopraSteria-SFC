import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { ChildWorkplacesResolver } from '@core/resolvers/child-workplaces.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
import { GetMissingCqcLocationsResolver } from '@core/resolvers/getMissingCqcLocations/getMissingCqcLocations.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { AboutParentsComponent } from '@features/pages/about-parents/about-parents.component';
import { CreateUserAccountComponent } from '@features/workplace/create-user-account/create-user-account.component';
import { UserAccountEditDetailsComponent } from '@features/workplace/user-account-edit-details/user-account-edit-details.component';
import { UserAccountSavedComponent } from '@features/workplace/user-account-saved/user-account-saved.component';
import { UserAccountViewComponent } from '@features/workplace/user-account-view/user-account-view.component';
import { ViewMyWorkplacesComponent } from '@features/workplace/view-my-workplaces/view-my-workplaces.component';
import { ChangeDataOwnerComponent } from './change-data-owner/change-data-owner.component';
import { ChangeExpiresSoonAlertsComponent } from './change-expires-soon-alerts/change-expires-soon-alerts.component';
import { DeleteUserAccountComponent } from './delete-user-account/delete-user-account.component';
import { EditWorkplaceComponent } from './edit-workplace/edit-workplace.component';
import { EmployedFromOutsideUkExistingWorkersComponent } from './employed-from-outside-uk-existing-workers/employed-from-outside-uk-existing-workers.component';
import { HealthAndCareVisaExistingWorkers } from './health-and-care-visa-existing-workers/health-and-care-visa-existing-workers.component';
import { SelectPrimaryUserDeleteComponent } from './select-primary-user-delete/select-primary-user-delete.component';
import { SelectPrimaryUserComponent } from './select-primary-user/select-primary-user.component';
import { UserAccountEditPermissionsComponent } from './user-account-edit-permissions/user-account-edit-permissions.component';
import { UsersComponent } from './users/users.component';
import { ChangeDataPermissionsComponent } from './change-data-permissions/change-data-permissions.component';
import { WorkplaceDataRoutes, workplaceQuestionsForFundingPage } from './workplace-data-routing';

// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: 'view-all-workplaces',
    component: ViewMyWorkplacesComponent,
    resolve: { childWorkplaces: ChildWorkplacesResolver, cqcLocations: GetMissingCqcLocationsResolver },
    canActivate: [ParentGuard],
    data: { title: 'View My Workplaces' },
  },
  {
    path: 'change-data-owner',
    component: ChangeDataOwnerComponent,
    resolve: { establishment: WorkplaceResolver },
    data: { title: 'Change Data Owner' },
  },
  {
    path: 'change-data-permissions',
    component: ChangeDataPermissionsComponent,
    resolve: { establishment: WorkplaceResolver, childWorkplaces: ChildWorkplacesResolver },
    data: { title: 'Change Data Permissions' },
  },
  {
    path: 'about-parents',
    component: AboutParentsComponent,
    data: {
      title: 'What you can do as a parent workplace',
    },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: ':establishmentuid',
    component: EditWorkplaceComponent,
    resolve: { establishment: WorkplaceResolver },
    canActivate: [HasPermissionsGuard],
    data: { title: 'Workplace' },
    children: [
      WorkplaceDataRoutes,
      ...workplaceQuestionsForFundingPage,

      {
        path: 'users',
        component: UsersComponent,
        data: {
          title: 'Workplace Users',
        },
        resolve: {
          users: AllUsersForEstablishmentResolver,
        },
      },
      {
        path: 'health-and-care-visa-existing-workers',
        component: HealthAndCareVisaExistingWorkers,
        canActivate: [CheckPermissionsGuard],
        resolve: {
          workers: WorkersResolver,
        },
        data: {
          permissions: ['canEditWorker'],
          title: 'Health And Care Visa',
        },
      },
      {
        path: 'employed-from-outside-or-inside-uk',
        component: EmployedFromOutsideUkExistingWorkersComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditWorker'],
          title: 'Employed from Outside the UK',
        },
      },

      {
        path: 'user/create',
        canActivate: [CheckPermissionsGuard],
        component: CreateUserAccountComponent,
        data: {
          permissions: ['canAddUser'],
          title: 'Create User Account',
        },
      },
      {
        path: 'user/saved/:useruid',
        canActivate: [CheckPermissionsGuard],
        component: UserAccountSavedComponent,
        resolve: { user: UserAccountResolver },
        data: {
          permissions: ['canAddUser'],
          title: 'User has been added',
        },
      },
      {
        path: 'user/:useruid',
        data: { title: 'View User Account' },
        children: [
          {
            path: '',
            component: UserAccountViewComponent,
            resolve: { user: UserAccountResolver },
          },
          {
            path: 'permissions',
            component: UserAccountEditPermissionsComponent,
            canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canEditUser'],
              title: 'Edit Permissions',
            },
          },
          {
            path: 'select-primary-user',
            component: SelectPrimaryUserComponent,
            canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canEditUser'],
              title: 'Select primary user',
            },
          },
          {
            path: 'select-primary-user-delete',
            component: SelectPrimaryUserDeleteComponent,
            canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canEditUser'],
              title: 'Select primary user to delete',
            },
          },
          {
            path: 'edit-details',
            component: UserAccountEditDetailsComponent,
            canActivate: [CheckPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canEditUser'],
              title: 'Edit User Details',
            },
          },
          {
            path: 'delete-user',
            component: DeleteUserAccountComponent,
            canActivate: [CheckPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canDeleteUser'],
              title: 'Delete User',
            },
          },
        ],
      },
      {
        path: 'staff-record',
        loadChildren: () => import('@features/workers/workers.module').then((m) => m.WorkersModule),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canViewWorker'],
          title: 'Staff Records',
        },
      },
      {
        path: 'training-and-qualifications',
        loadChildren: () =>
          import('@features/training-and-qualifications/training-and-qualifications.module').then(
            (m) => m.TrainingAndQualificationsModule,
          ),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canViewWorker'],
          title: 'Training and qualifications',
        },
      },
      {
        path: 'training-and-qualifications-record',
        loadChildren: () => import('@features/workers/workers.module').then((m) => m.WorkersModule),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canViewWorker'],
          title: 'Training and qualifications record',
        },
      },
      {
        path: 'benchmarks',
        loadChildren: () =>
          import('@shared/components/benchmarks-tab/benchmarks.module').then((m) => m.BenchmarksModule),

        data: {
          title: 'Benchmarks',
        },
      },
      {
        path: 'data-area',
        loadChildren: () =>
          import('@shared/components/data-area-tab/data-area-tab.module').then((m) => m.DataAreaTabModule),

        data: {
          title: 'Data Area',
        },
      },

      {
        path: 'add-and-manage-mandatory-training',
        loadChildren: () =>
          import('@features/training-and-qualifications/add-mandatory-training/add-mandatory-training.module').then(
            (m) => m.AddMandatoryTrainingModule,
          ),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditWorker'],
          title: 'Add Mandatory Training',
        },
      },
      {
        path: 'add-multiple-training',
        loadChildren: () =>
          import('@features/training-and-qualifications/add-multiple-training/add-multiple-training.module').then(
            (m) => m.AddMultipleTrainingModule,
          ),
        data: { title: 'Add Multiple Training' },
      },
      {
        path: 'change-expires-soon-alerts',
        component: ChangeExpiresSoonAlertsComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: {
          expiresSoonAlertDate: ExpiresSoonAlertDatesResolver,
        },
        data: { permissions: ['canEditEstablishment'], title: 'Change expires soon alerts' },
      },
      {
        path: 'training-course',
        loadChildren: () =>
          import('@features/training-and-qualifications/training-course/training-course.module').then(
            (m) => m.TrainingCourseModule,
          ),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditWorker'],
          title: 'Training course',
        },
      },
      {
        path: 'update-records-with-training-course-details',
        loadChildren: () =>
          import('@features/training-and-qualifications/update-records-with-training-course/update-records-with-training-course.module').then(
            (m) => m.UpdateRecordsWithTrainingCourseModule,
          ),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditWorker'],
          title: 'Update records with training course details',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkplaceRoutingModule {}
