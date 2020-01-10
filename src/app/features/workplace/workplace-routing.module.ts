import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { RoleGuard } from '@core/guards/role/role.guard';
import { Roles } from '@core/model/roles.enum';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { CreateUserAccountComponent } from '@features/workplace/create-user-account/create-user-account.component';
import {
  UserAccountEditDetailsComponent,
} from '@features/workplace/user-account-edit-details/user-account-edit-details.component';
import { UserAccountSavedComponent } from '@features/workplace/user-account-saved/user-account-saved.component';
import { UserAccountViewComponent } from '@features/workplace/user-account-view/user-account-view.component';
import { ViewMyWorkplacesComponent } from '@features/workplace/view-my-workplaces/view-my-workplaces.component';
import { ViewWorkplaceComponent } from '@features/workplace/view-workplace/view-workplace.component';

import { CheckAnswersComponent } from './check-answers/check-answers.component';
import { ConfirmLeaversComponent } from './confirm-leavers/confirm-leavers.component';
import { ConfirmStartersComponent } from './confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from './confirm-vacancies/confirm-vacancies.component';
import {
  DataSharingWithLocalAuthoritiesComponent,
} from './data-sharing-with-local-authorities/data-sharing-with-local-authorities.component';
import { DataSharingComponent } from './data-sharing/data-sharing.component';
import { EditWorkplaceComponent } from './edit-workplace/edit-workplace.component';
import { LeaversComponent } from './leavers/leavers.component';
import { OtherServicesComponent } from './other-services/other-services.component';
import { RegulatedByCqcComponent } from './regulated-by-cqc/regulated-by-cqc.component';
import { SelectMainServiceComponent } from './select-main-service/select-main-service.component';
import { SelectWorkplaceComponent } from './select-workplace/select-workplace.component';
import { ServiceUsersComponent } from './service-users/service-users.component';
import { ServicesCapacityComponent } from './services-capacity/services-capacity.component';
import { StartComponent } from './start/start.component';
import { StartersComponent } from './starters/starters.component';
import { SuccessComponent } from './success/success.component';
import { TypeOfEmployerComponent } from './type-of-employer/type-of-employer.component';
import {
  UserAccountEditPermissionsComponent,
} from './user-account-edit-permissions/user-account-edit-permissions.component';
import { VacanciesComponent } from './vacancies/vacancies.component';
import { WorkplaceNotFoundComponent } from './workplace-not-found/workplace-not-found.component';

const routes: Routes = [
  {
    path: 'view-all-workplaces',
    component: ViewMyWorkplacesComponent,
    canActivate: [ParentGuard],
    data: { title: 'View My Workplaces' },
  },
  {
    path: 'start-screen',
    data: { title: 'Start' },
  },
  {
    path: ':establishmentuid',
    component: EditWorkplaceComponent,
    resolve: { establishment: WorkplaceResolver },
    canActivate: [HasPermissionsGuard],
    data: { title: 'Workplace' },
    children: [
      {
        path: '',
        canActivate: [CheckPermissionsGuard],
        component: ViewWorkplaceComponent,
        data: {
          permissions: ['canViewEstablishment'],
          title: 'View Workplace',
        },
      },
      {
        path: 'start',
        component: StartComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Start',
        },
      },
      {
        path: 'regulated-by-cqc',
        component: RegulatedByCqcComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Regulated by CQC',
        },
      },

      {
        path: 'select-workplace',
        component: SelectWorkplaceComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Select Workplace',
        },
      },
      {
        path: 'workplace-not-found',
        component: WorkplaceNotFoundComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Workplace Not Found',
        },
      },

      {
        path: 'type-of-employer',
        component: TypeOfEmployerComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Type of Employer',
        },
      },
      {
        path: 'main-service',
        component: SelectMainServiceComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Main Service',
        },
      },
      {
        path: 'other-services',
        component: OtherServicesComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Other Services',
        },
      },
      {
        path: 'capacity-of-services',
        component: ServicesCapacityComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Capacity of Services',
        },
      },
      {
        path: 'service-users',
        component: ServiceUsersComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Service Users',
        },
      },
      {
        path: 'sharing-data',
        component: DataSharingComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Share Data',
        },
      },
      {
        path: 'sharing-data-with-local-authorities',
        component: DataSharingWithLocalAuthoritiesComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Share Data With Local Authorities',
        },
      },
      {
        path: 'vacancies',
        component: VacanciesComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Vacancies',
        },
      },
      {
        path: 'confirm-vacancies',
        component: ConfirmVacanciesComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Confirm Vacancies',
        },
      },
      {
        path: 'starters',
        component: StartersComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Starters',
        },
      },
      {
        path: 'confirm-starters',
        component: ConfirmStartersComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Confirm Starters',
        },
      },
      {
        path: 'leavers',
        component: LeaversComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Leavers',
        },
      },
      {
        path: 'confirm-leavers',
        component: ConfirmLeaversComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Confirm Leavers',
        },
      },
      {
        path: 'volunteers',
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Volunteers',
        },
      },
      {
        path: 'check-answers',
        component: CheckAnswersComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Check Answers',
        },
      },
      {
        path: 'success',
        component: SuccessComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Admin, Roles.Edit],
          title: 'Success',
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
        path: 'user/saved',
        canActivate: [CheckPermissionsGuard],
        component: UserAccountSavedComponent,
        data: {
          permissions: ['canAddUser'],
          title: 'User Account Saved',
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
            path: 'edit-details',
            component: UserAccountEditDetailsComponent,
            canActivate: [RoleGuard],
            resolve: { user: UserAccountResolver },
            data: {
              roles: [Roles.Admin],
              title: 'Edit User Details',
            },
          },
        ],
      },
      {
        path: 'staff-record',
        loadChildren: '@features/workers/workers.module#WorkersModule',
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canViewWorker'],
          title: 'Staff Records',
        },
      },
      {
        path: 'training-and-qualifications-record',
        loadChildren: '@features/workers/workers.module#WorkersModule',
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canViewWorker'],
          title: 'Training and qualifications record',
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
