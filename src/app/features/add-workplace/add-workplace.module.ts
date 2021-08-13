import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddWorkplaceRoutingModule } from '@features/add-workplace/add-workplace-routing.module';
import { RegulatedByCqcComponent } from '@features/add-workplace/regulated-by-cqc/regulated-by-cqc.component';
import { StartComponent } from '@features/add-workplace/start/start.component';
import { SharedModule } from '@shared/shared.module';

import { AddWorkplaceCompleteComponent } from './add-workplace-complete/add-workplace-complete.component';
import { ChangeYourDetailsComponent } from './change-your-details/change-your-details.component';
import { ConfirmAccountDetailsComponent } from './confirm-account-details/confirm-account-details.component';
import { ConfirmWorkplaceDetailsComponent } from './confirm-workplace-details/confirm-workplace-details.component';
import { CouldNotFindWorkplaceAddressComponent } from './could-not-find-workplace-address/could-not-find-workplace-address.component';
import { CreateUserAccountComponent } from './create-user-account/create-user-account.component';
import { FindWorkplaceAddressComponent } from './find-workplace-address/find-workplace-address.component';
import { FindYourWorkplaceComponent } from './find-your-workplace/find-your-workplace.component';
import { IsThisYourWorkplaceComponent } from './is-this-your-workplace/is-this-your-workplace.component';
import { NameOfWorkplaceComponent } from './name-of-workplace/name-of-workplace.component';
import { NewRegulatedByCqcComponent } from './new-regulated-by-cqc/new-regulated-by-cqc.component';
import { NewSelectMainServiceComponent } from './new-select-main-service/new-select-main-service.component';
import { NewWorkplaceNotFoundComponent } from './new-workplace-not-found/new-workplace-not-found.component';
import { SelectMainServiceComponent } from './select-main-service/select-main-service.component';
import { SelectWorkplaceAddressComponent } from './select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from './select-workplace/select-workplace.component';
import { WorkplaceAddedThankYouComponent } from './workplace-added-thank-you/workplace-added-thank-you.component';
import { WorkplaceNameAddressComponent } from './workplace-name-address/workplace-name-address.component';
import { WorkplaceNotFoundComponent } from './workplace-not-found/workplace-not-found.component';

@NgModule({
  imports: [CommonModule, AddWorkplaceRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [
    AddWorkplaceCompleteComponent,
    ChangeYourDetailsComponent,
    ConfirmAccountDetailsComponent,
    ConfirmWorkplaceDetailsComponent,
    CreateUserAccountComponent,
    FindWorkplaceAddressComponent,
    RegulatedByCqcComponent,
    NewRegulatedByCqcComponent,
    SelectMainServiceComponent,
    SelectWorkplaceAddressComponent,
    SelectWorkplaceComponent,
    StartComponent,
    WorkplaceNotFoundComponent,
    WorkplaceNameAddressComponent,
    NameOfWorkplaceComponent,
    NewWorkplaceNotFoundComponent,
    IsThisYourWorkplaceComponent,
    FindYourWorkplaceComponent,
    NewSelectMainServiceComponent,
    CouldNotFindWorkplaceAddressComponent,
    WorkplaceAddedThankYouComponent,
  ],
})
export class AddWorkplaceModule {}
