import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeYourDetailsComponent } from '@features/registration/change-your-details/change-your-details.component';
import {
  ConfirmAccountDetailsComponent,
} from '@features/registration/confirm-account-details/confirm-account-details.component';
import {
  ConfirmWorkplaceDetailsComponent,
} from '@features/registration/confirm-workplace-details/confirm-workplace-details.component';
import { CreateUsernameComponent } from '@features/registration/create-username/create-username.component';
import {
  EnterWorkplaceAddressComponent,
} from '@features/registration/enter-workplace-address/enter-workplace-address.component';
import {
  RegistrationAwaitingApprovalComponent,
} from '@features/registration/registration-awaiting-approval/registration-awaiting-approval.component';
import { RegistrationCompleteComponent } from '@features/registration/registration-complete/registration-complete.component';
import { RegistrationRoutingModule } from '@features/registration/registration-routing.module';
import { RegulatedByCqcComponent } from '@features/registration/regulated-by-cqc/regulated-by-cqc.component';
import { SecurityQuestionComponent } from '@features/registration/security-question/security-question.component';
import { SelectMainServiceComponent } from '@features/registration/select-main-service/select-main-service.component';
import {
  SelectWorkplaceAddressComponent,
} from '@features/registration/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/registration/select-workplace/select-workplace.component';
import { YourDetailsComponent } from '@features/registration/your-details/your-details.component';
import { SharedModule } from '@shared/shared.module';

import { FindWorkplaceAddressComponent } from './find-workplace-address/find-workplace-address.component';
import { StartComponent } from './start/start.component';
import { WorkplaceNotFoundComponent } from './workplace-not-found/workplace-not-found.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RegistrationRoutingModule],
  declarations: [
    ChangeYourDetailsComponent,
    ConfirmAccountDetailsComponent,
    ConfirmWorkplaceDetailsComponent,
    CreateUsernameComponent,
    EnterWorkplaceAddressComponent,
    FindWorkplaceAddressComponent,
    RegistrationCompleteComponent,
    RegistrationAwaitingApprovalComponent,
    RegulatedByCqcComponent,
    SecurityQuestionComponent,
    SelectMainServiceComponent,
    SelectWorkplaceAddressComponent,
    SelectWorkplaceComponent,
    YourDetailsComponent,
    StartComponent,
    WorkplaceNotFoundComponent,
  ],
})
export class RegistrationModule {}
