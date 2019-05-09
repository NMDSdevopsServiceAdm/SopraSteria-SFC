import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfirmLeaversComponent } from './confirm-leavers/confirm-leavers.component';
import { ConfirmStartersComponent } from './confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from './confirm-vacancies/confirm-vacancies.component';
import { EditWorkplaceComponent } from './edit-workplace/edit-workplace.component';
import { LeaversComponent } from './leavers/leavers.component';
import { SelectOtherServicesComponent } from './select-other-services/select-other-services.component';
import { ServiceUsersComponent } from './service-users/service-users.component';
import { ServicesCapacityComponent } from './services-capacity/services-capacity.component';
import { ShareLocalAuthorityComponent } from './share-local-authorities/share-local-authority.component';
import { ShareOptionsComponent } from './share-options/share-options.component';
import { StartersComponent } from './starters/starters.component';
import { TypeOfEmployerComponent } from './type-of-employer/type-of-employer.component';
import { VacanciesComponent } from './vacancies/vacancies.component';
import { WorkplaceResolver } from './workplace.resolver';

const routes: Routes = [
  {
    path: 'start-screen',
    data: { title: 'Start' },
  },
  {
    path: ':id',
    component: EditWorkplaceComponent,
    resolve: { worker: WorkplaceResolver },
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
        path: 'select-other-services',
        component: SelectOtherServicesComponent,
        data: { title: 'Select Other Services' },
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
        path: 'share-options',
        component: ShareOptionsComponent,
        data: { title: 'Data Sharing Options' },
      },
      {
        path: 'share-local-authority',
        component: ShareLocalAuthorityComponent,
        data: { title: 'Share Data with Local Authority' },
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
