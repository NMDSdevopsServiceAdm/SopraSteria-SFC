import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddWorkplaceRoutingModule } from '@features/add-workplace/add-workplace-routing.module';
import { RegulatedByCqcComponent } from '@features/add-workplace/regulated-by-cqc/regulated-by-cqc.component';
import { StartComponent } from '@features/add-workplace/start/start.component';
import { SharedModule } from '@shared/shared.module';
import { AddWorkplaceCompleteComponent } from './add-workplace-complete/add-workplace-complete.component';
import { ConfirmWorkplaceDetailsComponent } from './confirm-workplace-details/confirm-workplace-details.component';
import { CreateUserAccountComponent } from './create-user-account/create-user-account.component';
import { EnterWorkplaceAddressComponent } from './enter-workplace-address/enter-workplace-address.component';
import { FindWorkplaceAddressComponent } from './find-workplace-address/find-workplace-address.component';
import { SelectMainServiceComponent } from './select-main-service/select-main-service.component';
import { SelectWorkplaceAddressComponent } from './select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from './select-workplace/select-workplace.component';

@NgModule({
  imports: [CommonModule, AddWorkplaceRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [
    AddWorkplaceCompleteComponent,
    ConfirmWorkplaceDetailsComponent,
    CreateUserAccountComponent,
    EnterWorkplaceAddressComponent,
    FindWorkplaceAddressComponent,
    RegulatedByCqcComponent,
    SelectMainServiceComponent,
    SelectWorkplaceAddressComponent,
    SelectWorkplaceComponent,
    StartComponent,
  ],
})
export class AddWorkplaceModule {}
