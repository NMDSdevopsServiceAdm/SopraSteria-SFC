import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmAccountDetailsComponent } from '@features/create-account/user/confirm-account-details/confirm-account-details.component';
import { SecurityQuestionComponent } from '@features/create-account/user/create-security-question/create-security-question.component';
import { UsernamePasswordComponent } from '@features/create-account/user/username-password/username-password.component';
import { YourDetailsComponent } from '@features/create-account/user/your-details/your-details.component';
import { AddTotalStaffComponent } from '@features/create-account/workplace/add-total-staff/add-total-staff.component';
import { ConfirmDetailsComponent } from '@features/create-account/workplace/confirm-details/confirm-details.component';
import { ConfirmWorkplaceDetailsComponent } from '@features/create-account/workplace/confirm-workplace-details/confirm-workplace-details.component';
import { CouldNotFindWorkplaceAddressComponent } from '@features/create-account/workplace/could-not-find-workplace-address/could-not-find-workplace-address.component';
import { NameOfWorkplaceComponent } from '@features/create-account/workplace/name-of-workplace/name-of-workplace.component';
import { SelectWorkplaceAddressComponent } from '@features/create-account/workplace/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/create-account/workplace/select-workplace/select-workplace.component';
import { ThankYouComponent } from '@features/create-account/workplace/thank-you/thank-you.component';
import { WorkplaceNameAddressComponent } from '@features/create-account/workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceNotFoundComponent } from '@features/create-account/workplace/workplace-not-found/workplace-not-found.component';
import { PagesModule } from '@features/pages/pages.module';
import { ChangeYourDetailsComponent } from '@features/registration/change-your-details/change-your-details.component';
import { RegistrationCompleteComponent } from '@features/registration/registration-complete/registration-complete.component';
import { RegistrationRoutingModule } from '@features/registration/registration-routing.module';
import { TypeOfEmployerComponent } from '@features/workplace/type-of-employer/type-of-employer.component';
import { SharedModule } from '@shared/shared.module';

import { FindWorkplaceAddressComponent } from '../create-account/workplace/find-workplace-address/find-workplace-address.component';
import { FindYourWorkplaceComponent } from '../create-account/workplace/find-your-workplace/find-your-workplace.component';
import { IsThisYourWorkplaceComponent } from '../create-account/workplace/is-this-your-workplace/is-this-your-workplace.component';
import { RegulatedByCqcComponent } from '../create-account/workplace/regulated-by-cqc/regulated-by-cqc.component';
import { AboutUsRegistrationComponent } from './about-us/about-us.component';
import { CreateAccountComponent } from './create-account/create-account.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RegistrationRoutingModule, PagesModule],
  declarations: [
    ChangeYourDetailsComponent,
    ConfirmAccountDetailsComponent,
    ConfirmWorkplaceDetailsComponent,
    WorkplaceNameAddressComponent,
    FindWorkplaceAddressComponent,
    RegistrationCompleteComponent,
    ThankYouComponent,
    SecurityQuestionComponent,
    SelectWorkplaceAddressComponent,
    SelectWorkplaceComponent,
    YourDetailsComponent,
    AboutUsRegistrationComponent,
    CreateAccountComponent,
    FindYourWorkplaceComponent,
    IsThisYourWorkplaceComponent,
    RegulatedByCqcComponent,
    WorkplaceNotFoundComponent,
    NameOfWorkplaceComponent,
    UsernamePasswordComponent,
    CouldNotFindWorkplaceAddressComponent,
    ConfirmDetailsComponent,
    AddTotalStaffComponent,
    TypeOfEmployerComponent,
  ],
})
export class RegistrationModule {}
