import { CommonModule } from '@angular/common';
import { ConfirmLeaversComponent } from './confirm-leavers/confirm-leavers.component';
import { ConfirmStartersComponent } from './confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from './confirm-vacancies/confirm-vacancies.component';
import { DataSharingComponent } from './data-sharing/data-sharing.component';
import { DataSharingWithLocalAuthoritiesComponent } from './data-sharing-with-local-authorities/data-sharing-with-local-authorities.component';
import { EditWorkplaceComponent } from './edit-workplace/edit-workplace.component';
import { LeaversComponent } from './leavers/leavers.component';
import { NgModule } from '@angular/core';
import { OtherServicesComponent } from './other-services/other-services.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ServicesCapacityComponent } from './services-capacity/services-capacity.component';
import { ServiceUsersComponent } from './service-users/service-users.component';
import { SharedModule } from '@shared/shared.module';
import { StartersComponent } from './starters/starters.component';
import { TypeOfEmployerComponent } from './type-of-employer/type-of-employer.component';
import { VacanciesComponent } from './vacancies/vacancies.component';
import { ViewMyWorkplacesComponent } from './view-my-workplaces/view-my-workplaces.component';
import { WorkplaceResolver } from './workplace.resolver';
import { WorkplaceRoutingModule } from './workplace-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, WorkplaceRoutingModule],
  declarations: [
    ConfirmLeaversComponent,
    ConfirmStartersComponent,
    ConfirmVacanciesComponent,
    DataSharingComponent,
    DataSharingWithLocalAuthoritiesComponent,
    EditWorkplaceComponent,
    LeaversComponent,
    OtherServicesComponent,
    ServicesCapacityComponent,
    ServiceUsersComponent,
    StartersComponent,
    TypeOfEmployerComponent,
    VacanciesComponent,
    ViewMyWorkplacesComponent,
  ],
  providers: [WorkplaceResolver],
})
export class WorkplaceModule {}
