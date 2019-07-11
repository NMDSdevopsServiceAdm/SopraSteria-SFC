import { ChangeYourDetailsComponent } from '@features/registration/change-your-details/change-your-details.component';
import { CommonModule } from '@angular/common';
import { ConfirmAccountDetailsComponent } from '@features/registration/confirm-account-details/confirm-account-details.component';
import { ConfirmWorkplaceDetailsComponent } from '@features/registration/confirm-workplace-details/confirm-workplace-details.component';
import { CreateUsernameComponent } from '@features/registration/create-username/create-username.component';
import { EnterWorkplaceAddressComponent } from '@features/registration/enter-workplace-address/enter-workplace-address.component';
import { FindWorkplaceAddressComponent } from './find-workplace-address/find-workplace-address.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationCompleteComponent } from '@features/registration/registration-complete/registration-complete.component';
import { RegistrationRoutingModule } from '@features/registration/registration-routing.module';
import { RegulatedByCqcComponent } from '@features/registration/regulated-by-cqc/regulated-by-cqc.component';
import { SecurityQuestionComponent } from '@features/registration/security-question/security-question.component';
import { SelectMainServiceComponent } from '@features/registration/select-main-service/select-main-service.component';
import { SelectWorkplaceAddressComponent } from '@features/registration/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/registration/select-workplace/select-workplace.component';
import { SharedModule } from '@shared/shared.module';
import { YourDetailsComponent } from '@features/registration/your-details/your-details.component';

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
    RegulatedByCqcComponent,
    SecurityQuestionComponent,
    SelectMainServiceComponent,
    SelectWorkplaceAddressComponent,
    SelectWorkplaceComponent,
    YourDetailsComponent,
  ]
})
export class RegistrationModule {}
