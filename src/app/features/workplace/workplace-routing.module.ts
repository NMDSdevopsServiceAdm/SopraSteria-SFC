import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { RoleGuard } from '@core/guards/role/role.guard';
import { Roles } from '@core/model/roles.enum';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { CreateUserAccountComponent } from '@features/workplace/create-user-account/create-user-account.component';
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

const routes: Routes = [
  {
    path: 'view-my-workplaces',
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
    data: { title: 'Workplace' },
    children: [
      {
        path: '',
        component: ViewWorkplaceComponent,
        data: { title: 'View Workplace' },
      },
      {
        path: 'start',
        component: StartComponent,
        data: { title: 'Start' },
      },
      {
        path: 'type-of-employer',
        component: TypeOfEmployerComponent,
        data: { title: 'Type of Employer' },
      },
      {
        path: 'other-services',
        component: OtherServicesComponent,
        data: { title: 'Other Services' },
      },
      {
        path: 'capacity-of-services',
        component: ServicesCapacityComponent,
        data: { title: 'Capacity of Services' },
      },
      {
        path: 'service-users',
        component: ServiceUsersComponent,
        data: { title: 'Service Users' },
      },
      {
        path: 'sharing-data',
        component: DataSharingComponent,
        data: { title: 'Share Data' },
      },
      {
        path: 'sharing-data-with-local-authorities',
        component: DataSharingWithLocalAuthoritiesComponent,
        data: { title: 'Share Data With Local Authorities' },
      },
      {
        path: 'vacancies',
        component: VacanciesComponent,
        data: { title: 'Vacancies' },
      },
      {
        path: 'confirm-vacancies',
        component: ConfirmVacanciesComponent,
        data: { title: 'Confirm Vacancies' },
      },
      {
        path: 'starters',
        component: StartersComponent,
        data: { title: 'Starters' },
      },
      {
        path: 'confirm-starters',
        component: ConfirmStartersComponent,
        data: { title: 'Confirm Starters' },
      },
      {
        path: 'leavers',
        component: LeaversComponent,
        data: { title: 'Leavers' },
      },
      {
        path: 'confirm-leavers',
        component: ConfirmLeaversComponent,
        data: { title: 'Confirm Leavers' },
      },
      {
        path: 'volunteers',
        data: { title: 'Volunteers' },
      },
      {
        path: 'check-answers',
        component: CheckAnswersComponent,
        data: { title: 'Check Answers' },
      },
      {
        path: 'success',
        component: SuccessComponent,
        data: { title: 'Success' },
      },
      {
        path: 'user/create',
        component: CreateUserAccountComponent,
        canActivate: [RoleGuard],
        data: {
          roles: [Roles.Edit],
          title: 'Create User Account',
        },
      },
      {
        path: 'user/saved',
        component: UserAccountSavedComponent,
        data: { title: 'User Account Saved' },
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
            canActivate: [RoleGuard, EditUserPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              roles: [Roles.Edit],
              title: 'Edit Permissions',
            },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkplaceRoutingModule {}
