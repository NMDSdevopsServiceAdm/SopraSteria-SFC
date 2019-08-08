import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivateUserAccountRoutingModule } from '@features/activate-user-account/activate-user-account-routing.module';
import {
  ExpiredActivationLinkComponent,
} from '@features/activate-user-account/expired-activation-link/expired-activation-link.component';
import { SharedModule } from '@shared/shared.module';

import { ActivationCompleteComponent } from './activation-complete/activation-complete.component';
import { ConfirmAccountDetailsComponent } from './confirm-account-details/confirm-account-details.component';
import { CreateUsernameComponent } from './create-username/create-username.component';
import { SecurityQuestionComponent } from './security-question/security-question.component';
import { ChangeYourDetailsComponent } from './change-your-details/change-your-details.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, ActivateUserAccountRoutingModule],
  declarations: [
    ConfirmAccountDetailsComponent,
    CreateUsernameComponent,
    SecurityQuestionComponent,
    ActivationCompleteComponent,
    ExpiredActivationLinkComponent,
    ChangeYourDetailsComponent,
  ],
})
export class ActivateUserAccountModule {}
