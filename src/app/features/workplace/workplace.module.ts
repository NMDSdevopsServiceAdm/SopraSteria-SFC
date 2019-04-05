import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

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
import { WorkplaceRoutingModule } from './workplace-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, WorkplaceRoutingModule],
  declarations: [
    ConfirmLeaversComponent,
    ConfirmStartersComponent,
    ConfirmVacanciesComponent,
    LeaversComponent,
    SelectOtherServicesComponent,
    ServicesCapacityComponent,
    ServiceUsersComponent,
    ShareLocalAuthorityComponent,
    ShareOptionsComponent,
    StartersComponent,
    TypeOfEmployerComponent,
    VacanciesComponent,
  ],
})
export class WorkplaceModule {}
