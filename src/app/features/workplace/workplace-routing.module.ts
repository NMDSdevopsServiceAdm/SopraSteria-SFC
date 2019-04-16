import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfirmLeaversComponent } from './confirm-leavers/confirm-leavers.component';
import { ConfirmStartersComponent } from './confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from './confirm-vacancies/confirm-vacancies.component';
import { LeaversComponent } from './leavers/leavers.component';
import { SelectOtherServicesComponent } from './select-other-services/select-other-services.component';
import { ServiceUsersComponent } from './service-users/service-users.component';
import { ServicesCapacityComponent } from './services-capacity/services-capacity.component';
import { ShareLocalAuthorityComponent } from './share-local-authorities/share-local-authority.component';
import { ShareOptionsComponent } from './share-options/share-options.component';
import { StartersComponent } from './starters/starters.component';
import { TypeOfEmployerComponent } from './type-of-employer/type-of-employer.component';
import { VacanciesComponent } from './vacancies/vacancies.component';

const routes: Routes = [
  {
    path: 'start-screen',
    // component:
  },
  // FLOW
  {
    path: 'type-of-employer',
    component: TypeOfEmployerComponent,
  },
  {
    path: 'select-other-services',
    component: SelectOtherServicesComponent,
  },
  {
    path: 'capacity-of-services',
    component: ServicesCapacityComponent,
  },
  {
    path: 'service-users',
    component: ServiceUsersComponent,
  },
  {
    path: 'share-options',
    component: ShareOptionsComponent,
  },
  {
    path: 'share-local-authority',
    component: ShareLocalAuthorityComponent,
  },
  {
    path: 'vacancies',
    component: VacanciesComponent,
  },
  {
    path: 'confirm-vacancies',
    component: ConfirmVacanciesComponent,
  },
  {
    path: 'starters',
    component: StartersComponent,
  },
  {
    path: 'confirm-starters',
    component: ConfirmStartersComponent,
  },
  {
    path: 'leavers',
    component: LeaversComponent,
  },
  {
    path: 'confirm-leavers',
    component: ConfirmLeaversComponent,
  },
  {
    path: 'volunteers',
  },
  {
    path: 'summary',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkplaceRoutingModule {}
