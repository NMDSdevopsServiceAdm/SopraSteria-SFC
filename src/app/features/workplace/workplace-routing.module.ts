import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { StartersComponent } from './starters/starters.component';
import { TypeOfEmployerComponent } from './type-of-employer/type-of-employer.component';
import { VacanciesComponent } from './vacancies/vacancies.component';
import { WorkplaceResolver } from './workplace.resolver';
import { ViewMyWorkplacesComponent } from '@features/workplace/view-my-workplaces/view-my-workplaces.component';
import { ParentGuard } from '@core/guards/parent/parent.guard';

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
    path: ':establishmentid',
    component: EditWorkplaceComponent,
    resolve: { establishment: WorkplaceResolver },
    children: [
      {
        path: '',
        data: { title: 'Workplace' },
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
        path: 'summary',
        data: { title: 'Check Answers' },
      },
      {
        path: 'success',
        data: { title: 'Success' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkplaceRoutingModule {}
