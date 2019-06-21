import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

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
import { MyWorkplaceComponent } from './my-workplace/my-workplace.component';
import { OtherServicesComponent } from './other-services/other-services.component';
import { ServiceUsersComponent } from './service-users/service-users.component';
import { ServicesCapacityComponent } from './services-capacity/services-capacity.component';
import { StartersComponent } from './starters/starters.component';
import { SuccessComponent } from './success/success.component';
import { TypeOfEmployerComponent } from './type-of-employer/type-of-employer.component';
import { VacanciesComponent } from './vacancies/vacancies.component';
import { ViewMyWorkplacesComponent } from './view-my-workplaces/view-my-workplaces.component';
import { WorkplaceRoutingModule } from './workplace-routing.module';
import { WorkplaceResolver } from './workplace.resolver';
import { StartComponent } from './start/start.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, WorkplaceRoutingModule],
  declarations: [
    CheckAnswersComponent,
    ConfirmLeaversComponent,
    ConfirmStartersComponent,
    ConfirmVacanciesComponent,
    DataSharingComponent,
    DataSharingWithLocalAuthoritiesComponent,
    EditWorkplaceComponent,
    LeaversComponent,
    MyWorkplaceComponent,
    OtherServicesComponent,
    ServicesCapacityComponent,
    ServiceUsersComponent,
    StartersComponent,
    SuccessComponent,
    TypeOfEmployerComponent,
    VacanciesComponent,
    ViewMyWorkplacesComponent,
    StartComponent,
  ],
  providers: [WorkplaceResolver],
})
export class WorkplaceModule {}
